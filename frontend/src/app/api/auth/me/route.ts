export const runtime = "nodejs";

import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getBearer, assertRole } from "@/lib/roles";

export async function GET(req: Request) {
  try {
    const token = getBearer(req);
    if (!token) return new Response(JSON.stringify({ error: "Not logged in." }), { status: 401 });
    const { sub } = assertRole(req, ["user", "moderator", "admin"]);
    await dbConnect();
    const u = await User.findById(sub).select("email role status name createdAt").lean();
    return new Response(JSON.stringify({ me: u }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Not allowed" }), { status: 401 });
  }
}
