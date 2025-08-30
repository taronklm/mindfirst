export const runtime = "nodejs";

import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
    email: z.email(),
    password: z.string().min(8),
    name: z.string()
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name } = schema.parse(body);
        await dbConnect();
        const exists = await User.findOne({ email });
        if (exists) {
            return new Response(JSON.stringify({ error: "E-Mail is already in use."}), {status: 409})
        }
        const passwordHash = await hashPassword(password);
        const user = await User.create({ email, passwordHash, role: "user", status: "active", name });
        return new Response(JSON.stringify({ ok: true, id: user._id }), { status: 201 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        const msg = err?.errors ? "Invalid entry" : err?.message || "Error";
        console.log(err)
        return new Response(JSON.stringify({ error: msg}), { status: 400 });
    }
}