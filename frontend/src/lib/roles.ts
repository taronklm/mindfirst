import { verifyToken } from "./auth";
import { Role } from "@/models/User";

export function getBearer(req: Request) {
    const auth = req.headers.get("authorization") || "";
    const [scheme, token] = auth.split(" ");
    return scheme === "Bearer" && token ? token : null;
}

export function assertRole(req: Request, roles: Role[]) {
    const token = getBearer(req);
    if (!token) {
        throw new Error("unauthorized");
    }
    const payload = verifyToken(token);
    if (!roles.includes(payload.role)) {
        throw new Error("forbidden");
    }

    return payload;
}