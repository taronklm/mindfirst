import { Schema, model, models, Document, Types } from "mongoose";

export type AlertStatus = "new" | "acknowledged" | "closed";

export interface IAlert extends Document {
  userId: Types.ObjectId | null;     
  userEmail?: string;                 
  sessionId: string;                  
  lastUserMessage: string;            
  riskTags?: string[];                
  riskScore?: number;                 
  status: AlertStatus;
  assignedTo?: Types.ObjectId | null; 
  note?: string;                      
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    userEmail: { type: String },
    sessionId: { type: String, required: true, index: true },
    lastUserMessage: { type: String, required: true },
    riskTags: [{ type: String }],
    riskScore: { type: Number },
    status: { type: String, enum: ["new", "acknowledged", "closed"], default: "new", index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    note: { type: String },
  },
  { timestamps: true }
);

export default models.Alert || model<IAlert>("Alert", AlertSchema);
