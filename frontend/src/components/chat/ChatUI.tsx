import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { chatService } from "@/services/chat.service";
import { CHAT_HISTORY_SEED, CHAT_STARTERS } from "@/data/mockData";
import type { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";

interface Props { fullHeight?: boolean; }

export function ChatUI({ fullHeight }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_HISTORY_SEED);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, busy]);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setBusy(true);
    const res = await chatService.send(text, messages);
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: res.reply, createdAt: new Date().toISOString(), sources: res.sources }]);
    setBusy(false);
  };

  return (
    <Card className={cn("flex flex-col overflow-hidden rounded-2xl border-border/60 card-elevated", fullHeight ? "h-[calc(100vh-10rem)]" : "h-[560px]")}>
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></span>
        <div>
          <div className="text-sm font-semibold">PolicyWise AI Assistant</div>
          <div className="text-[11px] text-muted-foreground">Explains policies, compares plans, suggests fit</div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn("mb-4 flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
              {m.role === "assistant" && <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"><Bot className="h-4 w-4" /></div>}
              <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user" ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm bg-muted")}>
                {m.content}
                {m.sources && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.sources.map((s, i) => (
                      <span key={i} className="rounded-full bg-background/70 px-2 py-0.5 text-[10px] text-muted-foreground">{s.title}</span>
                    ))}
                  </div>
                )}
              </div>
              {m.role === "user" && <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><User className="h-4 w-4" /></div>}
            </motion.div>
          ))}
          {busy && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-primary-soft text-primary"><Bot className="h-4 w-4" /></div>
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "120ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "240ms" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {messages.length <= 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {CHAT_STARTERS.map((s) => (
              <button key={s} onClick={() => send(s)} className="rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary hover:text-primary">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="border-t p-3">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask about any policy…"
            rows={1}
            className="min-h-[44px] flex-1 resize-none rounded-xl"
          />
          <Button type="submit" size="icon" className="h-11 w-11 rounded-xl" disabled={busy || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
