export const runtime = "nodejs";

import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { assertRole } from "@/lib/roles";

export async function GET(req: Request) {
  try {
    assertRole(req, ["admin"]);
    await dbConnect();
    const users = await User.find({}).select("email role status createdAt").sort({ createdAt: -1 }).lean();
    return new Response(JSON.stringify({ users }), { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    const code = e?.code === 403 ? 403 : 401;
    return new Response(JSON.stringify({ error: "Not allowed" }), { status: code });
  }
}
