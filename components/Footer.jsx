import Link from "next/link";
import { safeQuery, isBotOnline } from "@/lib/db";
import StatusStrip from "@/components/StatusStrip";

export default async function Footer() {
  const [rows, online] = await Promise.all([
    safeQuery((sql) => sql`SELECT COALESCE(SUM(member_count),0) AS m, COUNT(*) AS g FROM guilds`),
    isBotOnline(),
  ]);
  const r = rows[0] || { m: 0, g: 0 };

  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-display text-sm font-bold">
              <span className="flex h-6 w-6 items-center justify-center border border-signal/40 bg-signal/10 font-mono text-xs text-signal">Y</span>
              <span>YOBEST <span className="text-signal">STUDIO</span></span>
            </div>
            <StatusStrip initialOnline={online} totalMembers={Number(r.m)} guildCount={Number(r.g)} compact />
          </div>

          {/* Links */}
          <nav className="grid grid-cols-2 gap-x-12 gap-y-2 font-mono text-xs uppercase tracking-wider text-muted sm:grid-cols-3">
            <Link href="/"           className="transition hover:text-paper">Home</Link>
            <Link href="/games"      className="transition hover:text-paper">Games</Link>
            <Link href="/dashboard"  className="transition hover:text-paper">Dashboard</Link>
            <Link href="/ai"         className="transition hover:text-signal">AI Chat</Link>
            <Link href="/bot-control"className="transition hover:text-amber">Control Panel</Link>
            <a href="https://discord.gg/yobest" target="_blank" rel="noreferrer"
               className="transition hover:text-paper">Discord ↗</a>
          </nav>
        </div>

        <div className="mt-8 border-t border-line pt-6 flex items-center justify-between">
          <p className="font-mono text-[11px] text-muted">© {new Date().getFullYear()} Yobest Studio</p>
          <p className="font-mono text-[11px] text-line">Bot ID 1456027240977399818</p>
        </div>
      </div>
    </footer>
  );
}
