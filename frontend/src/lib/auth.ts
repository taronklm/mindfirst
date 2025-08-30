import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET is missing.");

export async function hashPassword(pw: string) {
    return bcrypt.hash(pw, 12);
}

export async function verifyPassord(pw: string, hash: string) {
    return bcrypt.compare(pw, hash);
} 

export function signToken(payload: { sub: string; role: Role }) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as { sub: string; role: Role; iat: number; exp: number };
}