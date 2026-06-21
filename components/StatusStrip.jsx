"use client";
import { useEffect, useState } from "react";

export default function StatusStrip({ initialOnline = false, totalMembers = 0, guildCount = 0, compact = false }) {
  const [online, setOnline] = useState(initialOnline);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const r = await fetch("/api/bot-status", { cache: "no-store" });
        const d = await r.json();
        setOnline(!!d.online);
      } catch {}
      setChecked(true);
    }
    check();
    const t = setInterval(check, 60_000);
    return () => clearInterval(t);
  }, []);

  const color   = online ? "text-signal"   : "text-ember";
  const dotCls  = online ? "bg-signal dot-online" : "bg-ember";
  const label   = online ? "Bot online"    : "Bot offline";
  const opacity = checked ? "opacity-100"  : "opacity-60";

  return (
    <div className={`inline-flex flex-wrap items-center gap-3 border border-line bg-panel/70 font-mono uppercase tracking-wider transition-opacity ${opacity} ${
      compact ? "px-3 py-1.5 text-[10px]" : "px-4 py-2.5 text-xs"
    }`}>
      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${dotCls}`} />
      <span className={`font-semibold ${color}`}>{label}</span>
      <span className="text-line">·</span>
      <span className="text-muted">{totalMembers.toLocaleString()} members</span>
      <span className="text-line">·</span>
      <span className="text-muted">{guildCount} {guildCount === 1 ? "server" : "servers"}</span>
    </div>
  );
}
