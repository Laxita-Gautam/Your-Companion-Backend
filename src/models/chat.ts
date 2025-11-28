
// import mongoose,{Schema,Document,model,Types} from "mongoose";

// export interface IChatMessage{
//     role:"user" | "assistant";
//     content: string;
//     timestamp: Date;
//     metadata?: {
//         technique: string;
//         goal:string;
//         progress:any[];
//     };
// }

// export interface IChatSession extends Document{
//     _id: Types.ObjectId;
//   sessionId: string;
//   userId: Types.ObjectId;
//   startTime: Date;
//   status: "active" | "completed" | "archived";
//   messages: IChatMessage[];
// }

// const chatMessageSchema = new Schema<IChatMessage>({
//     role:{
//         type:String,
//         enum:["user","assistant"],
//         required:true,
//     },
//     content:{
//         type:String,
//         required:true,
//     },
//     timestamp:{
//         type:Date,
//         default:Date.now,
//     },
//     metadata:{
//         technique:String,
//         goal:String,
//         progress:[Schema.Types.Mixed],
//     },
// });

// const chatSessionSchema = new Schema<IChatSession>(
//     {
//         sessionId:{
//             type:String,
//             required:true,
//             unique:true,
//         },
//         messages:[chatMessageSchema],
    
// });

// export const ChatSession = model<IChatSession>(
//     "ChatSession",
//     chatSessionSchema
// );

import mongoose, { Schema, Document, model, Types } from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
metadata?: {
  technique?: string;
  goal?: string;
  analysis?: any;  // ✅ add this line
  progress?: {
    emotionalState: string;
    riskLevel: number;
  };
};

}

export interface IChatSession extends Document {
  _id: Types.ObjectId;
  sessionId: string;
  userId: Types.ObjectId;
  startTime: Date;
  status: "active" | "completed" | "archived";
  messages: IChatMessage[];
}

const chatMessageSchema = new Schema<IChatMessage>({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    technique: String,
    goal: String,
    progress: {
      emotionalState: { type: String, default: "unknown" },
      riskLevel: { type: Number, default: 0 },
    },
  },
});

const chatSessionSchema = new Schema<IChatSession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
    messages: [chatMessageSchema],
  },
  { timestamps: true }
);

export const ChatSession = model<IChatSession>("ChatSession", chatSessionSchema);




