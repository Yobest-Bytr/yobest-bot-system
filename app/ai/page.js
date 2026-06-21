"use client";
import { useState, useRef, useEffect, useCallback } from "react";

const STARTERS = [
  "How do I script a basic combat system in Roblox?",
  "What's the difference between LocalScript and Script?",
  "How do I use Lua tables effectively?",
  "Best monetisation strategies for Roblox games?",
  "How do I make smooth camera movement in Roblox?",
  "Explain RemoteEvents vs RemoteFunctions",
];

function Thinking() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bubble-ai px-4 py-3 max-w-xs">
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-signal">Yobest AI</span>
        <div className="flex gap-1 items-center">
          {[0, 150, 300].map((d) => (
            <span key={d} className="h-1.5 w-1.5 rounded-full bg-signal animate-bounce"
                  style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex mb-4 fade-up ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${isUser ? "bubble-user" : "bubble-ai"}`}>
        {!isUser && (
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-signal">Yobest AI</span>
        )}
        <p className="whitespace-pre-wrap text-paper">{msg.content}</p>
        <p className="mt-1 font-mono text-[10px] text-muted">{msg.time}</p>
      </div>
    </div>
  );
}

export default function AIPage() {
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setError(null);

    const userMsg   = { role: "user", content: msg, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    const nextHist  = [...messages, userMsg];
    setMessages(nextHist);
    setLoading(true);

    try {
      const res  = await fetch("/api/ai-chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: nextHist.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, messages, loading]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 pb-6" style={{ height: "calc(100vh - 3.5rem - 1px)" }}>

      {/* Header */}
      <div className="border-b border-line py-5">
        <p className="font-mono text-xs uppercase tracking-widest text-signal">Powered by Claude</p>
        <h1 className="mt-0.5 font-display text-2xl font-bold text-paper">AI Assistant</h1>
        <p className="mt-1 text-xs text-muted">Ask about Roblox, Lua scripting, or Yobest Studio</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center border border-signal/20 bg-signal/5">
              <span className="text-2xl">🤖</span>
            </div>
            <p className="mt-3 font-display text-base font-semibold text-paper">Ask Yobest AI</p>
            <p className="mt-1 text-xs text-muted">Try one of these to get started</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 max-w-lg">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="border border-line bg-panel px-3 py-2 text-left text-xs text-muted transition hover:border-signal/40 hover:text-paper hover:bg-raised">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => <Message key={i} msg={m} />)}
        {loading && <Thinking />}

        {error && (
          <div className="mb-4 flex items-center gap-2 border border-ember/20 bg-ember/5 px-4 py-3 text-sm text-ember">
            <span>⚠</span> {error}
            <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-line pt-4">
        {messages.length > 0 && (
          <div className="mb-3 flex justify-between items-center">
            <p className="font-mono text-[10px] uppercase text-muted">{messages.filter(m => m.role === "user").length} messages</p>
            <button onClick={() => { setMessages([]); setError(null); }}
              className="font-mono text-[10px] uppercase tracking-wider text-muted transition hover:text-ember">
              Clear conversation
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about Roblox, Lua, or the studio…"
            disabled={loading}
            className="flex-1 border border-line bg-panel px-4 py-3 text-sm text-paper placeholder-muted outline-none transition focus:border-signal/50 disabled:opacity-50"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="border border-signal bg-signal/10 px-5 py-3 font-mono text-xs uppercase tracking-wider text-signal transition hover:bg-signal hover:text-ink disabled:opacity-30"
          >
            {loading ? "…" : "Send"}
          </button>
        </div>
        <p className="mt-2 font-mono text-[10px] text-muted">
          Powered by Claude · For Roblox, Lua, and Yobest Studio questions
        </p>
      </div>
    </div>
  );
}
