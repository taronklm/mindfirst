/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Conversation from "@/models/Conversation";
import { assertRole } from "@/lib/roles";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    assertRole(req, ["admin", "moderator"]);
    const { id } = params;
    const { flagged, status } = await req.json();

    await dbConnect();
    const update: any = {};
    if (typeof flagged === "boolean") {
      update["risk.flagged"] = flagged;
      update["risk.escalatedAt"] = flagged ? new Date() : undefined;
    }
    if (status && ["open", "closed"].includes(status)) {
      update.status = status;
    }

    await Conversation.findByIdAndUpdate(id, { $set: update });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const code = e?.code === 403 ? 403 : 401;
    return NextResponse.json({ error: "Not allowed" }, { status: code });
  }
}
