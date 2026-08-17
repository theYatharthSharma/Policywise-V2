import { createFileRoute } from "@tanstack/react-router";
import { ChatUI } from "@/components/chat/ChatUI";

export const Route = createFileRoute("/app/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant — PolicyWise" }, { name: "description", content: "Chat with our AI assistant to explore, compare and understand insurance policies." }] }),
  component: () => (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold">AI Assistant</h1><p className="text-sm text-muted-foreground">Ask anything about insurance policies, premiums or claims.</p></div>
      <ChatUI fullHeight />
    </div>
  ),
});
