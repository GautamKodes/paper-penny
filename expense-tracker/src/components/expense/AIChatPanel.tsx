import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, RotateCcw, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExpenses } from "@/hooks/useExpenses";
import { buildContext, demoAnswer } from "@/lib/expenses/assistantContext";
import { chatApi, isDemoMode, type ChatMessage } from "@/services/api";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Where am I spending the most?",
  "Summarize my expenses this month.",
  "How can I reduce my food expenses?",
  "Compare this month with last month.",
  "Identify unusual expenses.",
  "Give me three practical ways to save money.",
];

export function AIChatPanel() {
  const { all, filtered, range } = useExpenses();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, pending, failed]);

  const ask = async (text: string, history = messages) => {
    const msg = text.trim();
    if (!msg || pending) return;
    const next = [...history, { role: "user" as const, content: msg }];
    setMessages(next);
    setInput("");
    setFailed(null);
    setPending(true);
    try {
      const reply = isDemoMode
        ? await new Promise<string>((r) => setTimeout(() => r(demoAnswer(msg, all, filtered, range)), 500))
        : await chatApi.send(msg, history, buildContext(all, filtered, range));
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      setFailed(e instanceof Error ? e.message : "The assistant is unavailable.");
    } finally {
      setPending(false);
    }
  };

  const retry = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    ask(lastUser.content, messages.slice(0, messages.lastIndexOf(lastUser)));
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold">AI Expense Assistant</h2>
          <p className="text-xs text-muted-foreground">Ask questions about your spending.</p>
        </div>
        {messages.length > 0 && (
          <Button size="icon" variant="ghost" aria-label="Clear chat" onClick={() => { setMessages([]); setFailed(null); }}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isDemoMode && (
        <div className="border-b bg-warning-soft px-5 py-2 text-xs">
          <strong>Demo mode:</strong> AI backend not connected. Answers are calculated locally from your data, not by AI.
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Avatar />
              <div className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm">Hi! I can help you understand your spending. Try one of these:</div>
            </div>
            <div className="flex flex-wrap gap-2 pl-9">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => ask(s)}
                  className="rounded-full border bg-card px-3 py-1.5 text-left text-xs transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-2", m.role === "user" && "justify-end")}>
            {m.role === "assistant" && <Avatar />}
            <div className={cn("max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm",
              m.role === "user" ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm bg-muted")}>
              {m.content}
            </div>
          </div>
        ))}
        {pending && (
          <div className="flex gap-2"><Avatar />
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
            </div>
          </div>
        )}
        {failed && (
          <div role="alert" className="ml-9 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs">
            <p>{failed}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={retry}><RotateCcw className="h-3.5 w-3.5" /> Retry</Button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-2">
          {SUGGESTIONS.slice(0, 4).map((s) => (
            <button key={s} onClick={() => ask(s)} disabled={pending}
              className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs hover:text-primary disabled:opacity-50">{s}</button>
          ))}
        </div>
      )}
      <form className="flex gap-2 border-t p-3" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
        <Input aria-label="Message the assistant" placeholder="Ask about your expenses…" value={input} onChange={(e) => setInput(e.target.value)} disabled={pending} />
        <Button type="submit" size="icon" aria-label="Send" disabled={pending || !input.trim()}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}

function Avatar() {
  return <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"><Bot className="h-4 w-4" /></div>;
}
