import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTED = [
  "Which components risk a stockout in the next 4 weeks?",
  "Summarize my Asia-only single-source dependencies.",
  "Suggest second-source candidates for STM32H743ZIT6.",
  "What's my biggest supply chain risk this week?",
];

export default function Copilot() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [params] = useSearchParams();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const p = params.get("prompt");
    if (p) send(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    let acc = "";

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next, mode: "copilot" }),
      });

      if (resp.status === 429) {
        toast.error("Rate limit reached. Try again in a moment.");
        setLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
        setLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) {
        toast.error("Failed to reach AI service.");
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(j);
            const t = p.choices?.[0]?.delta?.content;
            if (t) {
              acc += t;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: acc } : m));
                }
                return [...prev, { role: "assistant", content: acc }];
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      toast.error("Connection error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] w-full max-w-3xl flex-col p-6 md:p-8">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Sparkles className="h-5 w-5 text-accent" />
          AI Copilot
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Ask anything about your components, suppliers, or risks.</p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden p-0 shadow-sm">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <p className="text-sm font-medium">How can I help with your supply chain?</p>
              <p className="mt-1 text-xs text-muted-foreground">Try one of these prompts:</p>
              <div className="mt-5 flex w-full max-w-md flex-col gap-2">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm transition-colors hover:border-accent/40 hover:bg-accent/5"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                  <div className="whitespace-pre-wrap">{m.content || (loading && i === messages.length - 1 ? "▍" : "")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="border-t border-border bg-card p-3"
        >
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about components, suppliers, or risks…"
              className="h-10 border-border bg-background text-sm"
              disabled={loading}
            />
            <Button type="submit" size="icon" className="h-10 w-10 shrink-0 bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading || !input.trim()}>
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
