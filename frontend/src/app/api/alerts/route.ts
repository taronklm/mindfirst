export const runtime = "nodejs";

import { dbConnect } from "@/lib/db";
import Alert from "@/models/Alert";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { sessionId, lastUserMessage } = await req.json();
    if (!sessionId || !lastUserMessage) {
      return new Response(
        JSON.stringify({ error: "sessionId and lastUserMessage is mandatory." }),
        { status: 400 }
      );
    }

    await dbConnect();

    let userId: string | null = null;
    let userEmail: string | undefined;
    const auth = req.headers.get("authorization") || "";
    const [scheme, token] = auth.split(" ");
    if (scheme === "Bearer" && token) {
      try {
        const payload = verifyToken(token);
        userId = payload.sub;
        const u = await User.findById(userId).select("email");
        userEmail = u?.email;
      } catch(e) {
        console.log("Error: ", e)
      }
    }

    const alert = await Alert.create({
      userId,
      userEmail,
      sessionId,
      lastUserMessage,
      status: "new",
    });

    return new Response(JSON.stringify({ alertId: String(alert._id) }), { status: 201 });
  } catch (e) {
    console.error("Error creating alert:", e);
    return new Response(JSON.stringify({ error: "Error when creating Alerts." }), { status: 500 });
  }
}
