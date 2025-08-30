import { Schema, model, models, Document } from "mongoose";

export type Role = "user" | "moderator" | "admin";

export interface IUser extends Document {
    email: string;
    name: string;
    passwordHash: string;
    role: Role;
    status: "active" | "suspended";
    createdAt: Date;
    upadatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true, index: true},
        name: { type: String, required: true},
        passwordHash: { type: String, required: true},
        role: { type: String, enum: ["user", "moderator", "admin"], default: "user", index: true},
        status: { type: String, enum: ["active", "suspended"], default: "active"},
    },
    { timestamps: true}
)

export default models.User || model<IUser>("User", UserSchema);