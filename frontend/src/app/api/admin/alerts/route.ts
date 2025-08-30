/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";

import { dbConnect } from "@/lib/db";
import Alert from "@/models/Alert";
import { assertRole } from "@/lib/roles";

export async function GET(req: Request) {
  try {
    assertRole(req, ["admin", "moderator"]);
    await dbConnect();
    const alerts = await Alert.find({})
      .select("userEmail sessionId lastUserMessage status riskTags riskScore createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return new Response(JSON.stringify({ alerts }), { status: 200 });
  } catch (e: any) {
    const code = e?.code === 403 ? 403 : 401;
    return new Response(JSON.stringify({ error: "Not allowed" }), { status: code });
  }
}

export async function PATCH(req: Request) {
  try {
    assertRole(req, ["admin", "moderator"]);
    await dbConnect();

    const { id, status, note } = await req.json();
    if (!id || !["new", "acknowledged", "closed"].includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid inputs" }), { status: 400 });
    }

    const update: any = { status };
    if (typeof note === "string") update.note = note;

    await Alert.findByIdAndUpdate(id, update);
    return new Response(null, { status: 204 });
  } catch (e: any) {
    const code = e?.code === 403 ? 403 : 401;
    return new Response(JSON.stringify({ error: "Not allowed" }), { status: code });
  }
}
