/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Conversation from "@/models/Conversation";
import { assertRole } from "@/lib/roles";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    assertRole(req, ["admin", "moderator"]);
    await dbConnect();
    const list = await Conversation.find({ "risk.flagged": true })
      .select("sessionId userId lastMessageAt risk messages")
      .sort({ lastMessageAt: -1 })
      .limit(50)
      .lean();

    const data = list.map((c) => {
      const lastMsg = c.messages?.[c.messages.length - 1];
      return {
        _id: String(c._id),
        sessionId: c.sessionId,
        userId: c.userId ? String(c.userId) : null,
        flagged: c.risk?.flagged ?? false,
        escalatedAt: c.risk?.escalatedAt,
        lastMessageAt: c.lastMessageAt,
        lastSnippet: lastMsg ? `${lastMsg.role}: ${String(lastMsg.content).slice(0, 160)}` : "",
      };
    });

    return NextResponse.json({ conversations: data }, { status: 200 });
  } catch (e: any) {
    const code = e?.code === 403 ? 403 : 401;
    return NextResponse.json({ error: "Not allowed" }, { status: code });
  }
}
