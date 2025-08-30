import { Schema, model, models } from "mongoose";

export type ChatRole = "user" | "assistant";

const MessageSchema = new Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ConversationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    sessionId: { type: String, required: true, unique: true, index: true },
    messages: { type: [MessageSchema], default: [] },
    risk: {
      flagged: { type: Boolean, default: false },
      reason: { type: String, default: "" },
      escalatedAt: { type: Date },
    },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.Conversation || model("Conversation", ConversationSchema);
