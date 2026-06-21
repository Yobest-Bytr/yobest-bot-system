"use client";
import { useSession, signIn } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";

const CLIENT_ID  = "1456027240977399818";
const BOT_INVITE = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;

/* ── tiny shared UI ─────────────────────────────────────────────────────── */
function Card({ children, className = "" }) {
  return <div className={`border border-line bg-panel p-5 ${className}`}>{children}</div>;
}
function Label({ children }) {
  return <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">{children}</p>;
}
function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} className={`toggle-track ${on ? "on" : "off"}`} aria-pressed={on}>
      <span className="toggle-thumb" />
    </button>
  );
}
function StatusBadge({ status }) {
  const map = {
    done:    { color: "bg-signal/20 text-signal",  dot: "bg-signal",  label: "Done"    },
    pending: { color: "bg-amber/20 text-amber",    dot: "bg-amber animate-pulse", label: "Pending" },
    error:   { color: "bg-ember/20 text-ember",    dot: "bg-ember",   label: "Error"   },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-[10px] uppercase ${s.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
function Toast({ msg, ok, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 shadow-2xl animate-fade-in font-mono text-sm ${ok ? "bg-signal text-ink" : "bg-ember text-white"}`}>
      {ok ? "✓" : "✕"} {msg}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">×</button>
    </div>
  );
}

/* ── Login gate ──────────────────────────────────────────────────────────── */
function LoginGate() {
  return (
    <section className="mx-auto max-w-md px-6 py-24 text-center">
      <div className="border border-line bg-panel p-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-line bg-raised text-2xl">🔒</div>
        <h1 className="font-display text-xl font-bold text-paper">Control Panel</h1>
        <p className="mt-2 text-sm text-muted">
          Sign in with Discord to access the bot control panel. Only authorised server owners can make changes.
        </p>
        <button onClick={() => signIn("discord")}
          className="mt-6 flex w-full items-center justify-center gap-2 bg-[#5865F2] px-6 py-3 font-display text-sm font-semibold text-white transition hover:bg-[#4752C4]">
          <svg width="18" height="14" viewBox="0 0 127.14 96.36" fill="currentColor">
            <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z"/>
          </svg>
          Sign in with Discord
        </button>
        <div className="mt-6 border-t border-line pt-5">
          <p className="mb-3 text-xs text-muted">Don't have the bot yet?</p>
          <a href={BOT_INVITE} target="_blank" rel="noreferrer"
             className="inline-block border border-signal/40 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-signal transition hover:border-signal hover:bg-signal/10">
            + Add Bot to Your Server
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Main panel ──────────────────────────────────────────────────────────── */
const TABS = [
  { id: "overview",  label: "📊 Overview"    },
  { id: "settings",  label: "⚙ Settings"     },
  { id: "commands",  label: "📡 Commands"    },
  { id: "ai",        label: "🤖 AI Prompt"   },
];

function Panel({ session }) {
  const [tab,         setTab]         = useState("overview");
  const [toast,       setToast]       = useState(null);
  const [botOnline,   setBotOnline]   = useState(false);
  const [guilds,      setGuilds]      = useState([]);
  const [config,      setConfig]      = useState({});
  const [rawConfig,   setRawConfig]   = useState([]);
  const [cmdLog,      setCmdLog]      = useState([]);
  const [activeGuild, setActiveGuild] = useState("");
  const [saving,      setSaving]      = useState(false);

  // AI tab state
  const [aiPrompt,   setAiPrompt]    = useState("");
  const [aiEnabled,  setAiEnabled]   = useState(true);
  const [xpEnabled,  setXpEnabled]   = useState(true);
  const [amEnabled,  setAmEnabled]   = useState(true);
  const [aiModel,    setAiModel]     = useState("openai/gpt-4o-mini");

  // Commands tab state
  const [announceChannel, setAnnounceChannel] = useState("");
  const [announceMsg,     setAnnounceMsg]     = useState("");

  // AI test
  const [aiTestInput,  setAiTestInput]  = useState("");
  const [aiTestReply,  setAiTestReply]  = useState("");
  const [aiTestLoading,setAiTestLoading]= useState(false);

  function showToast(msg, ok = true) { setToast({ msg, ok }); }

  const load = useCallback(async () => {
    try {
      const [statusRes, cfgRes, cmdRes, guildRes] = await Promise.all([
        fetch("/api/bot-status"),
        fetch("/api/bot-config"),
        fetch("/api/bot-command"),
        fetch("/api/guilds"),
      ]);
      const [st, cf, cm, gu] = await Promise.all([
        statusRes.json(), cfgRes.json(), cmdRes.json(), guildRes.json(),
      ]);

      setBotOnline(!!st.online);

      if (cf.config) {
        setRawConfig(cf.config);
        const kv = Object.fromEntries(cf.config.map((r) => [r.key, r.value]));
        setConfig(kv);
        setAiPrompt(kv.ai_system_prompt ?? "");
        setAiEnabled(kv.ai_enabled !== "false");
        setXpEnabled(kv.xp_enabled !== "false");
        setAmEnabled(kv.automod_enabled !== "false");
        setAiModel(kv.ai_model ?? "openai/gpt-4o-mini");
      }
      if (cm.commands) setCmdLog(cm.commands);
      if (gu.guilds?.length) {
        setGuilds(gu.guilds);
        setActiveGuild((prev) => prev || gu.guilds[0].guild_id);
      }
    } catch {}
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 30_000); return () => clearInterval(t); }, [load]);

  async function saveCfg(key, value) {
    setSaving(true);
    try {
      const r    = await fetch("/api/bot-config", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const data = await r.json();
      data.ok ? showToast("Saved — bot picks this up within 60 s") : showToast(data.error ?? "Save failed", false);
      await load();
    } catch { showToast("Network error", false); }
    finally { setSaving(false); }
  }

  async function sendCmd(command, payload = {}) {
    if (!activeGuild) return showToast("Select a server first", false);
    try {
      const r    = await fetch("/api/bot-command", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId: activeGuild, command, payload }),
      });
      const data = await r.json();
      data.ok ? showToast("Command queued — bot executes within 15 s") : showToast(data.error ?? "Failed", false);
      await load();
    } catch { showToast("Network error", false); }
  }

  async function testAI() {
    if (!aiTestInput.trim() || aiTestLoading) return;
    setAiTestLoading(true); setAiTestReply("");
    try {
      const r    = await fetch("/api/ai-chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: aiTestInput }] }),
      });
      const data = await r.json();
      setAiTestReply(data.reply ?? data.error ?? "No response");
    } catch (e) { setAiTestReply("Error: " + e.message); }
    finally { setAiTestLoading(false); }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {toast && <Toast msg={toast.msg} ok={toast.ok} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-amber">Owner Access</p>
          <h1 className="mt-0.5 font-display text-3xl font-bold text-paper">Control Panel</h1>
          <p className="mt-1 text-sm text-muted">
            Signed in as <span className="text-paper font-semibold">{session.user.name}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-2 border px-3 py-2 font-mono text-xs ${botOnline ? "border-signal/30 bg-signal/5 text-signal" : "border-ember/30 bg-ember/5 text-ember"}`}>
            <span className={`h-2 w-2 rounded-full ${botOnline ? "bg-signal dot-online" : "bg-ember"}`} />
            Bot {botOnline ? "online" : "offline"}
          </div>
          <a href={BOT_INVITE} target="_blank" rel="noreferrer"
             className="border border-line px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted transition hover:border-signal/40 hover:text-signal">
            + Add to Another Server
          </a>
        </div>
      </div>

      {/* Server selector */}
      {guilds.length > 1 && (
        <div className="mb-6">
          <Label>Active server</Label>
          <select value={activeGuild} onChange={(e) => setActiveGuild(e.target.value)}
            className="w-full max-w-xs border border-line bg-panel px-3 py-2 font-mono text-xs text-paper outline-none focus:border-signal/50 sm:w-auto">
            {guilds.map((g) => (
              <option key={g.guild_id} value={g.guild_id}>{g.name} ({Number(g.member_count).toLocaleString()} members)</option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-5 py-3 font-mono text-xs uppercase tracking-wider transition ${
              tab === t.id ? "border-b-2 border-signal text-signal" : "text-muted hover:text-paper"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ────────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-5 max-w-3xl">
          {guilds.length === 0 ? (
            <div className="border border-dashed border-line p-12 text-center">
              <p className="text-sm text-muted">No servers yet. The bot updates this table every 5 minutes.</p>
              <a href={BOT_INVITE} target="_blank" rel="noreferrer"
                 className="mt-4 inline-block border border-signal/40 px-5 py-2 font-mono text-xs uppercase text-signal transition hover:bg-signal/10">
                Add Bot to a Server
              </a>
            </div>
          ) : guilds.map((g) => (
            <Card key={g.guild_id}>
              <div className="flex items-start gap-4">
                {g.icon_url
                  /* eslint-disable-next-line @next/next/no-img-element */
                  ? <img src={g.icon_url} alt="" className="h-12 w-12 rounded-full border border-line flex-shrink-0" />
                  : <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-raised font-mono text-sm text-muted flex-shrink-0">{g.name?.[0]}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base font-semibold text-paper">{g.name}</p>
                  <p className="font-mono text-xs text-muted">{Number(g.member_count).toLocaleString()} members · Boost {g.boost_level}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-right">
                  {[
                    ["AI", aiEnabled ? "On" : "Off", aiEnabled],
                    ["XP", xpEnabled ? "On" : "Off", xpEnabled],
                    ["Automod", amEnabled ? "On" : "Off", amEnabled],
                    ["Bot", botOnline ? "Online" : "Offline", botOnline],
                  ].map(([k, v, ok]) => (
                    <div key={k}>
                      <p className="font-mono text-[10px] uppercase text-muted">{k}</p>
                      <p className={`font-mono text-xs font-bold ${ok ? "text-signal" : "text-ember"}`}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}

          {cmdLog.length > 0 && (
            <div>
              <Label>Recent web commands</Label>
              <div className="border border-line bg-panel divide-y divide-line">
                {cmdLog.slice(0, 6).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                    <StatusBadge status={c.status} />
                    <span className="font-mono text-xs text-paper font-semibold">{c.command}</span>
                    <span className="flex-1 truncate font-mono text-xs text-muted">{JSON.stringify(c.payload)}</span>
                    <span className="font-mono text-[10px] text-muted flex-shrink-0">
                      {new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SETTINGS ────────────────────────────────────────────────────── */}
      {tab === "settings" && (
        <div className="max-w-2xl space-y-5">
          <Card>
            <h2 className="mb-4 font-display text-sm font-semibold text-paper">Feature Toggles</h2>
            <div className="divide-y divide-line">
              {[
                { label: "AI Responses",  sub: "Bot replies to mentions and AI commands", val: aiEnabled,  set: (v) => { setAiEnabled(v);  saveCfg("ai_enabled",      String(v)); } },
                { label: "XP System",     sub: "Members earn XP for chatting",            val: xpEnabled,  set: (v) => { setXpEnabled(v);  saveCfg("xp_enabled",      String(v)); } },
                { label: "Auto-Mod",      sub: "Automatically flag toxic content",         val: amEnabled,  set: (v) => { setAmEnabled(v);  saveCfg("automod_enabled", String(v)); } },
              ].map(({ label, sub, val, set }) => (
                <div key={label} className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-medium text-paper">{label}</p>
                    <p className="text-xs text-muted">{sub}</p>
                  </div>
                  <Toggle on={val} onToggle={() => set(!val)} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 font-display text-sm font-semibold text-paper">Raw Config Store</h2>
            <p className="mb-4 text-xs text-muted">All bot_config keys currently in Neon. Bot polls every 60 s.</p>
            <div className="max-h-60 space-y-1.5 overflow-y-auto">
              {rawConfig.map((r) => (
                <div key={r.key} className="flex items-start gap-3 font-mono text-[11px]">
                  <span className="w-44 flex-shrink-0 truncate text-signal">{r.key}</span>
                  <span className="flex-1 truncate text-muted">{r.value}</span>
                  <span className="flex-shrink-0 text-line">{r.updated_by}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── COMMANDS ────────────────────────────────────────────────────── */}
      {tab === "commands" && (
        <div className="max-w-2xl space-y-5">
          <Card>
            <h2 className="mb-4 font-display text-sm font-semibold text-paper">Quick Actions</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { label: "🔄 Sync Slash Commands",  cmd: "sync_commands"  },
                { label: "📊 Snapshot Guild Stats",  cmd: "snapshot_stats" },
                { label: "🔔 Test Welcome Message",  cmd: "test_welcome"   },
                { label: "🧹 Prune History Data",    cmd: "prune_data"     },
              ].map(({ label, cmd }) => (
                <button key={cmd} onClick={() => sendCmd(cmd)}
                  className="border border-line bg-raised px-4 py-3 text-left text-xs text-muted transition hover:border-signal/40 hover:text-paper">
                  {label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 font-display text-sm font-semibold text-paper">Send Announcement</h2>
            <p className="mb-4 text-xs text-muted">Bot sends a message to the specified channel ID in the selected server.</p>
            <Label>Channel ID</Label>
            <input value={announceChannel} onChange={(e) => setAnnounceChannel(e.target.value)}
              placeholder="e.g. 1234567890123456789"
              className="mb-3 w-full border border-line bg-ink px-3 py-2 font-mono text-xs text-paper outline-none focus:border-signal/50" />
            <Label>Message</Label>
            <textarea value={announceMsg} onChange={(e) => setAnnounceMsg(e.target.value)}
              rows={4} placeholder="Announcement text…"
              className="mb-3 w-full resize-none border border-line bg-ink px-3 py-2 font-mono text-xs text-paper outline-none focus:border-signal/50" />
            <button
              onClick={() => {
                if (!announceChannel.trim() || !announceMsg.trim()) return;
                sendCmd("announce", { channelId: announceChannel.trim(), message: announceMsg.trim() });
                setAnnounceChannel(""); setAnnounceMsg("");
              }}
              disabled={!announceChannel.trim() || !announceMsg.trim()}
              className="border border-signal px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-signal transition hover:bg-signal hover:text-ink disabled:opacity-30">
              Queue Announcement
            </button>
          </Card>

          <Card>
            <h2 className="mb-4 font-display text-sm font-semibold text-paper">Command Log</h2>
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {cmdLog.length ? cmdLog.map((c) => (
                <div key={c.id} className="border border-line px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs font-semibold text-paper">{c.command}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  {c.payload && Object.keys(c.payload).length > 0 && (
                    <p className="mt-1 font-mono text-[10px] text-muted truncate">{JSON.stringify(c.payload)}</p>
                  )}
                  {c.result && <p className="mt-1 font-mono text-[10px] text-muted">{c.result}</p>}
                  <p className="mt-1.5 font-mono text-[10px] text-line">
                    {new Date(c.created_at).toLocaleString()}
                    {c.executed_at && ` → executed ${new Date(c.executed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                  </p>
                </div>
              )) : <p className="text-xs text-muted">No commands yet — use Quick Actions above.</p>}
            </div>
          </Card>
        </div>
      )}

      {/* ── AI PROMPT ───────────────────────────────────────────────────── */}
      {tab === "ai" && (
        <div className="max-w-2xl space-y-5">
          <Card>
            <h2 className="mb-1 font-display text-sm font-semibold text-paper">System Prompt</h2>
            <p className="mb-4 text-xs text-muted">
              This is the personality and context the bot uses for all AI replies in Discord.
              Changes take effect within 60 seconds of saving.
            </p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={10}
              className="w-full resize-y border border-line bg-ink px-3 py-3 font-mono text-xs leading-relaxed text-paper outline-none focus:border-signal/50"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted">{aiPrompt.length} chars</span>
              <button onClick={() => saveCfg("ai_system_prompt", aiPrompt)} disabled={saving}
                className="border border-signal px-5 py-2 font-mono text-xs uppercase tracking-wider text-signal transition hover:bg-signal hover:text-ink disabled:opacity-40">
                {saving ? "Saving…" : "Save Prompt"}
              </button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 font-display text-sm font-semibold text-paper">AI Model</h2>
            <Label>Model (via OpenRouter)</Label>
            <select value={aiModel}
              onChange={(e) => { setAiModel(e.target.value); saveCfg("ai_model", e.target.value); }}
              className="w-full border border-line bg-ink px-3 py-2 font-mono text-xs text-paper outline-none focus:border-signal/50">
              {[
                "openai/gpt-4o-mini",
                "openai/gpt-4o",
                "anthropic/claude-3-haiku",
                "anthropic/claude-3-sonnet",
                "meta-llama/llama-3.1-8b-instruct",
                "google/gemini-flash-1.5",
              ].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Card>

          <Card>
            <h2 className="mb-1 font-display text-sm font-semibold text-paper">Live Test</h2>
            <p className="mb-4 text-xs text-muted">Send a test message using the current system prompt.</p>
            <div className="flex gap-2 mb-3">
              <input value={aiTestInput} onChange={(e) => setAiTestInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && testAI()}
                placeholder="Type a test message…"
                className="flex-1 border border-line bg-ink px-3 py-2 font-mono text-xs text-paper outline-none focus:border-signal/50" />
              <button onClick={testAI} disabled={aiTestLoading || !aiTestInput.trim()}
                className="border border-signal px-4 py-2 font-mono text-xs uppercase text-signal transition hover:bg-signal hover:text-ink disabled:opacity-30">
                {aiTestLoading ? "…" : "Ask"}
              </button>
            </div>
            {aiTestReply && (
              <div className="bubble-ai p-4 font-mono text-xs leading-relaxed text-paper whitespace-pre-wrap">
                {aiTestReply}
              </div>
            )}
          </Card>
        </div>
      )}
    </section>
  );
}

export default function BotControlPage() {
  const { data: session, status } = useSession();
  if (status === "loading") {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-signal border-t-transparent" />
      </div>
    );
  }
  return session ? <Panel session={session} /> : <LoginGate />;
}
