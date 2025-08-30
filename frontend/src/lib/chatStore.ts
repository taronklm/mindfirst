/* eslint-disable @typescript-eslint/no-explicit-any */
import { dbConnect } from "@/lib/db";
import Conversation from "@/models/Conversation";
import { Types } from "mongoose";

type SaveTurnInput = {
  sessionId: string;
  userId?: string | null;
  userMessage: string;
  assistantMessage: string;
  escalation?: boolean;
  reason?: string;
};

export async function saveChatTurn(input: SaveTurnInput) {
  const { sessionId, userId, userMessage, assistantMessage, escalation, reason } = input;
  if (!sessionId) throw new Error("sessionId is missing");

  await dbConnect();

  const now = new Date();
  const pushPayload = {
    $each: [
      { role: "user", content: userMessage, createdAt: now },
      { role: "assistant", content: assistantMessage, createdAt: now },
    ],
    $slice: -50,
  } as const;

  const setPayload: any = {
    lastMessageAt: now,
  };
  if (escalation) {
    setPayload["risk.flagged"] = true;
    setPayload["risk.escalatedAt"] = now;
    if (reason) setPayload["risk.reason"] = reason.slice(0, 200);
  }

  await Conversation.findOneAndUpdate(
    { sessionId },
    {
      $setOnInsert: {
        userId: userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null,
      },
      $push: { messages: pushPayload },
      $set: setPayload,
    },
    { upsert: true, new: true }
  );
}
