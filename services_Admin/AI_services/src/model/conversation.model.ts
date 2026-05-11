import mongoose, { Schema, Document } from "mongoose";


export interface IMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}


export interface IConversation extends Document {
  userId: string; 
  title: string;
  messages: IMessage[];
  lastMessage?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
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
  },
  { _id: false }
);


const ConversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: String,
      required: true,
      index: true, 
    },

    title: {
      type: String,
      default: "Cuộc trò chuyện mới",
    },

    messages: {
      type: [MessageSchema],
      default: [],
    },

    lastMessage: {
      type: String,
      default: "",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index({ userId: 1, updatedAt: -1 });

const Conversation = mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);

export default Conversation;