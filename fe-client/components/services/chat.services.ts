const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/client"
).replace("/client", "/ai");

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ConversationSummary {
  _id: string;
  title: string;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail {
  _id: string;
  title: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatResponse {
  reply: string;
  conversationId: string;
}

export async function sendChatMessage(
  message: string,
  userId: string,
  conversationId?: string | null,
): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, userId, conversationId }),
  });

  if (!res.ok) {
    throw new Error("Gửi tin nhắn thất bại");
  }

  return res.json();
}

export async function getConversations(
  userId: string,
): Promise<ConversationSummary[]> {
  const res = await fetch(`${API_URL}/conversations?userId=${userId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Lấy danh sách hội thoại thất bại");
  }

  return res.json();
}

export async function getConversation(
  id: string,
  userId: string,
): Promise<ConversationDetail> {
  const res = await fetch(`${API_URL}/conversations/${id}?userId=${userId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Lấy chi tiết hội thoại thất bại");
  }

  return res.json();
}

export async function deleteConversation(
  id: string,
  userId: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/conversations/${id}?userId=${userId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Xóa hội thoại thất bại");
  }
}
