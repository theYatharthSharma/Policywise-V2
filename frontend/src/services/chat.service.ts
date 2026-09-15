import { apiFetch } from "@/lib/api";
import type { ChatMessage } from "@/types";

interface ChatMessageApiShape {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  sources: { title: string; url?: string }[];
}

interface ChatReplyApiShape {
  reply: ChatMessageApiShape;
  history: ChatMessageApiShape[];
}

function toChatMessage(m: ChatMessageApiShape): ChatMessage {
  return { id: m.id, role: m.role, content: m.content, createdAt: m.created_at, sources: m.sources };
}

export const chatService = {
  send: async (message: string, _history: ChatMessage[]): Promise<{ reply: string; sources: { title: string }[] }> => {
    const data = await apiFetch<ChatReplyApiShape>("/chat/send", {
      method: "POST",
      auth: true,
      body: { message },
    });
    return { reply: data.reply.content, sources: data.reply.sources };
  },
  history: async (): Promise<ChatMessage[]> => {
    const data = await apiFetch<ChatMessageApiShape[]>("/chat/history", { auth: true });
    return data.map(toChatMessage);
  },
};
