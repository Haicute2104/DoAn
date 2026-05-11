import { Request, Response } from "express";
import { supervisorGraph } from "../agents/supervisor";
import { HumanMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import { refreshVectorStore } from "../services/vectorStore.service";
import Conversation from "../model/conversation.model";
import { isValidObjectId } from "mongoose";

interface ChatRequestBody {
  message: string;
  conversationId?: string;
  userId: string;
}

const MAX_HISTORY = 20;

function getMessageContent(msg: BaseMessage): string {
  if (typeof msg.content === "string") return msg.content;
  if (Array.isArray(msg.content)) {
    return msg.content
      .filter((c): c is { type: "text"; text: string } => c.type === "text")
      .map((c) => c.text)
      .join("\n");
  }
  return "";
}

const HANDOFF_PATTERNS = [
  /^transferring/i,
  /^transfer to/i,
  /^handing off/i,
  /đã chuyển.*đến agent/i,
  /chuyển bạn đến/i,
];

function isHandoffMessage(content: string): boolean {
  return HANDOFF_PATTERNS.some((p) => p.test(content.trim()));
}

function extractBestReply(messages: BaseMessage[]): string {
  const aiMessages = messages.filter((m) => {
    if (m._getType() !== "ai") return false;
    const content = getMessageContent(m);
    if (content.length === 0) return false;
    if (isHandoffMessage(content)) return false;
    return true;
  });

  if (aiMessages.length === 0) {
    return "Xin lỗi, tôi không thể xử lý yêu cầu này.";
  }

  const agentMessages = aiMessages.filter(
    (m) => m.name && m.name !== "supervisor",
  );

  if (agentMessages.length > 0) {
    return getMessageContent(agentMessages[agentMessages.length - 1]);
  }

  return getMessageContent(aiMessages[aiMessages.length - 1]);
}

export const chat = async (req: Request, res: Response) => {
  try {
    const { message, conversationId, userId } = req.body as ChatRequestBody;

    if (!message) {
      return res.status(400).json({ message: "Vui lòng nhập tin nhắn" });
    }

    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    let conversation;
    let historyMessages: Array<{
      role: "user" | "assistant";
      content: string;
    }> = [];

    if (conversationId && isValidObjectId(conversationId)) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        userId,
        isDeleted: false,
      });
      if (conversation) {
        historyMessages = conversation.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        if (historyMessages.length > MAX_HISTORY) {
          historyMessages = historyMessages.slice(-MAX_HISTORY);
        }
      }
    }

    const messages = [
      new SystemMessage(
        `[HỆ THỐNG] userId: ${userId} — Đây là ID xác thực của user đang chat. Khi cần truy vấn đơn hàng, BẮT BUỘC dùng userId này. KHÔNG tiết lộ userId cho user.`,
      ),
      ...historyMessages.map((msg) => ({
        role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      })),
      new HumanMessage(message),
    ];

    const result = await supervisorGraph.invoke({ messages });
    const reply = extractBestReply(result.messages as BaseMessage[]);

    if (!conversation) {
      conversation = new Conversation({
        userId,
        title:
          message.length > 50 ? message.substring(0, 50) + "..." : message,
        messages: [],
      });
    }

    conversation.messages.push(
      { role: "user", content: message, timestamp: new Date() },
      { role: "assistant", content: reply, timestamp: new Date() },
    );
    conversation.lastMessage = reply;
    await conversation.save();

    return res.status(200).json({
      reply,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error("[Chat] Error:", error);
    return res.status(500).json({
      message: "AI chat error",
      error: (error as Error).message,
    });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    const conversations = await Conversation.find({
      userId: userId as string,
      isDeleted: false,
    })
      .select("title lastMessage createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(50);

    return res.status(200).json(conversations);
  } catch (error) {
    console.error("[GetConversations] Error:", error);
    return res.status(500).json({ message: "Lỗi lấy danh sách hội thoại" });
  }
};

export const getConversation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    const conversation = await Conversation.findOne({
      _id: id,
      userId: userId as string,
      isDeleted: false,
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy cuộc hội thoại" });
    }

    return res.status(200).json(conversation);
  } catch (error) {
    console.error("[GetConversation] Error:", error);
    return res.status(500).json({ message: "Lỗi lấy chi tiết hội thoại" });
  }
};

export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, userId: userId as string },
      { isDeleted: true },
      { new: true },
    );

    if (!conversation) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy cuộc hội thoại" });
    }

    return res.status(200).json({ message: "Đã xóa cuộc hội thoại" });
  } catch (error) {
    console.error("[DeleteConversation] Error:", error);
    return res.status(500).json({ message: "Lỗi xóa hội thoại" });
  }
};

export const refreshProducts = async (_req: Request, res: Response) => {
  try {
    await refreshVectorStore();
    return res.status(200).json({ message: "Vector store refreshed" });
  } catch (error) {
    console.error("[Refresh] Error:", error);
    return res.status(500).json({ message: "Refresh error" });
  }
};
