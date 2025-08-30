export const runtime = "nodejs";

import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { verifyPassord, signToken } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
    email: z.email(),
    password: z.string().min(1),
})

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = schema.parse(body);
        await dbConnect();
        const user = await User.findOne({ email });
        if (!user) return new Response(JSON.stringify({ error: "Login failed." }), { status: 401 });

        const ok = await verifyPassord(password, user.passwordHash);
        if(!ok || user.status !== "active") {
            return new Response(JSON.stringify({ error: "Login failed."}), { status: 401 });
        }
        const token = signToken({ sub: user._id.toString(), role: user.role });
        return new Response(JSON.stringify({ token, role: user.role }), { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.log("Err: ", err)
        return new Response(JSON.stringify({ error: "Error "}), { status: 400 })
    }
}