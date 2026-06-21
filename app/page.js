import Link from "next/link";
import { safeQuery, isBotOnline } from "@/lib/db";
import StatusStrip from "@/components/StatusStrip";
import GameCard    from "@/components/GameCard";

export const revalidate = 30;

const CLIENT_ID    = "1456027240977399818";
const BOT_INVITE   = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;
const DISCORD_JOIN = "https://discord.gg/yobest";

export default async function HomePage() {
  const [guilds, games, online] = await Promise.all([
    safeQuery((sql) => sql`
      SELECT COALESCE(SUM(member_count),0) AS total, COUNT(*) AS guild_count FROM guilds`),
    safeQuery((sql) => sql`
      SELECT title,description,play_url,image_url FROM games
      WHERE status='live' ORDER BY created_at DESC LIMIT 3`),
    isBotOnline(),
  ]);

  const g = guilds[0] ?? { total: 0, guild_count: 0 };

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="grid-paper absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-ink/70 to-ink" />

        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          {/* Eyebrow */}
          <div className="mb-5 inline-flex items-center gap-2 border border-signal/20 bg-signal/5 px-3 py-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-signal dot-online" : "bg-ember"}`} />
            <span className="font-mono text-[11px] uppercase tracking-widest text-signal">
              {online ? "Bot Online" : "Bot Offline"} · Yobest Studio
            </span>
          </div>

          <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.1] tracking-tight text-paper sm:text-5xl lg:text-6xl">
            Your Discord server,<br />
            <span className="text-signal">wired to the web.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
            Yobest Studio builds Roblox games and AI tools. Our Discord bot manages the
            community and syncs every stat, score, and release directly to this site
            — in real time.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={DISCORD_JOIN} target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-2 bg-signal px-5 py-2.5 font-display text-sm font-semibold text-ink transition hover:bg-signal/85">
              <svg width="16" height="12" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z"/>
              </svg>
              Join Discord
            </a>
            <a href={BOT_INVITE} target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-2 border border-signal/40 px-5 py-2.5 font-display text-sm font-semibold text-signal transition hover:border-signal hover:bg-signal/10">
              + Add Bot to Your Server
            </a>
            <Link href="/games"
               className="inline-flex items-center gap-2 border border-line px-5 py-2.5 font-display text-sm font-semibold text-muted transition hover:border-muted hover:text-paper">
              Browse Games →
            </Link>
          </div>

          {/* Status strip */}
          <div className="mt-10">
            <StatusStrip
              initialOnline={online}
              totalMembers={Number(g.total)}
              guildCount={Number(g.guild_count)}
            />
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ───────────────────────────────────────────────────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mb-8 font-mono text-xs uppercase tracking-widest text-muted">What's inside</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "📊", href: "/dashboard",   accent: "signal",
                title: "Live Dashboard",
                desc:  "Member counts, XP leaderboard, and server stats updated by the bot every 5 minutes.",
              },
              {
                icon: "🎮", href: "/games",       accent: "signal",
                title: "Game Catalog",
                desc:  "Every Roblox game published from Discord with /addgame — no CMS needed.",
              },
              {
                icon: "🤖", href: "/ai",          accent: "signal",
                title: "AI Assistant",
                desc:  "Ask anything about Roblox, Lua scripting, or the studio. Powered by Claude.",
              },
              {
                icon: "⚙️", href: "/bot-control", accent: "amber",
                title: "Control Panel",
                desc:  "Sign in with Discord to manage the bot — settings, AI prompt, and live commands.",
              },
            ].map(({ icon, href, accent, title, desc }) => (
              <Link key={href} href={href}
                className={`group border border-line bg-panel p-5 transition hover:border-${accent}/40`}>
                <span className="text-2xl">{icon}</span>
                <h3 className={`mt-3 font-display text-sm font-semibold text-paper transition group-hover:text-${accent}`}>
                  {title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{desc}</p>
                <p className={`mt-4 font-mono text-xs text-${accent}/60 transition group-hover:text-${accent}`}>
                  Open →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED GAMES ──────────────────────────────────────────────────── */}
      {games.length > 0 && (
        <section className="border-b border-line">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted">Latest releases</p>
                <h2 className="mt-1 font-display text-2xl font-bold text-paper">Games</h2>
              </div>
              <Link href="/games" className="font-mono text-xs uppercase tracking-wider text-muted transition hover:text-paper">
                All games →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => <GameCard key={game.title} game={game} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Architecture</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-paper">One database, two endpoints</h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
            The bot and the site share a single Neon Postgres database. Bot writes, site
            reads. They never talk directly — either can restart without affecting the other.
          </p>
          <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-3">
            {[
              {
                label: "Bot writes",
                color: "text-signal",
                items: ["XP & levels on every message","Guild stats every 5 min","Heartbeat every 30s","Tickets opened & closed","Games via /addgame","Scripts via /announcescript"],
              },
              {
                label: "Neon Postgres",
                color: "text-amber",
                items: ["Shared source of truth","Survives bot restarts","Vercel edge compatible","web_commands queue","bot_config live store","Full history for charts"],
              },
              {
                label: "Site reads",
                color: "text-signal",
                items: ["True online/offline status","Live dashboard & leaderboard","Growth sparklines","Game catalog","AI chat with Claude","Bot control panel"],
              },
            ].map(({ label, color, items }) => (
              <div key={label} className="bg-ink p-6">
                <p className={`font-mono text-xs font-bold uppercase tracking-widest ${color}`}>{label}</p>
                <ul className="mt-4 space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-muted">
                      <span className="mt-0.5 text-line select-none">—</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DISCORD CTA ─────────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Community</p>
          <h2 className="mx-auto mt-2 max-w-lg font-display text-2xl font-bold text-paper">
            The studio lives in Discord
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Game drops, script releases, tickets, and XP all happen there first.
            This site is the read-only window.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={DISCORD_JOIN} target="_blank" rel="noreferrer"
               className="border border-signal px-7 py-3 font-display text-sm font-semibold text-signal transition hover:bg-signal hover:text-ink">
              Join the server →
            </a>
            <a href={BOT_INVITE} target="_blank" rel="noreferrer"
               className="border border-line px-7 py-3 font-display text-sm font-semibold text-muted transition hover:border-muted hover:text-paper">
              Add bot to your server →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
