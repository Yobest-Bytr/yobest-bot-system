import { safeQuery, dbConfigured, isBotOnline } from "@/lib/db";
import StatusStrip    from "@/components/StatusStrip";
import Sparkline      from "@/components/Sparkline";
import LeaderboardRow from "@/components/LeaderboardRow";

export const revalidate = 15;
export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  if (!dbConfigured) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20">
        <div className="border border-dashed border-line p-12 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Not configured</p>
          <p className="mt-3 text-sm text-muted">
            Set <code>DATABASE_URL</code> in Vercel project settings to activate the dashboard.
          </p>
        </div>
      </section>
    );
  }

  const [guilds, leaderboard, counts, online] = await Promise.all([
    safeQuery((sql) => sql`
      SELECT guild_id, name, icon_url, member_count, boost_level, updated_at
      FROM guilds ORDER BY member_count DESC`),
    safeQuery((sql) => sql`
      SELECT user_id, username, avatar_url, xp, level
      FROM xp ORDER BY level DESC, xp DESC LIMIT 10`),
    safeQuery((sql) => sql`
      SELECT
        (SELECT COUNT(*) FROM tickets WHERE status='open')       AS open_tickets,
        (SELECT COUNT(*) FROM custom_commands)                    AS custom_cmds,
        (SELECT COUNT(*) FROM games WHERE status='live')          AS live_games,
        (SELECT COUNT(*) FROM warnings)                           AS warnings,
        (SELECT COUNT(*) FROM xp)                                 AS ranked_users`),
    isBotOnline(),
  ]);

  const histories = await Promise.all(
    guilds.map((g) => safeQuery((sql) => sql`
      SELECT member_count FROM guild_stats_history
      WHERE guild_id = ${g.guild_id}
      ORDER BY captured_at DESC LIMIT 48`))
  );

  const totalMembers = guilds.reduce((s, g) => s + Number(g.member_count || 0), 0);
  const c = counts[0] ?? {};

  const statCards = [
    { label: "Members",        value: totalMembers.toLocaleString(), color: "text-signal" },
    { label: "Ranked Users",   value: c.ranked_users  ?? 0,          color: "text-signal" },
    { label: "Live Games",     value: c.live_games    ?? 0,          color: "text-signal" },
    { label: "Open Tickets",   value: c.open_tickets  ?? 0,          color: c.open_tickets > 0 ? "text-amber" : "text-muted" },
    { label: "Custom Commands",value: c.custom_cmds   ?? 0,          color: "text-muted"  },
    { label: "Total Warnings", value: c.warnings      ?? 0,          color: "text-muted"  },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-signal">Live</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-paper">Dashboard</h1>
        </div>
        <StatusStrip initialOnline={online} totalMembers={totalMembers} guildCount={guilds.length} />
      </div>

      {/* Stat cards */}
      <div className="grid gap-px border border-line bg-line grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map(({ label, value, color }) => (
          <div key={label} className="bg-ink p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</p>
            <p className={`mt-2 font-display text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">

        {/* Servers + sparklines */}
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">Servers</p>
          {guilds.length > 0 ? (
            <div className="space-y-3">
              {guilds.map((g, i) => (
                <div key={g.guild_id} className="border border-line bg-panel p-5">
                  <div className="flex items-center gap-3">
                    {g.icon_url
                      /* eslint-disable-next-line @next/next/no-img-element */
                      ? <img src={g.icon_url} alt="" className="h-10 w-10 rounded-full border border-line" />
                      : <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-raised font-mono text-xs text-muted">{g.name?.[0]}</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-paper">{g.name}</p>
                      <p className="font-mono text-xs text-muted">
                        {Number(g.member_count).toLocaleString()} members · Boost {g.boost_level}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[10px] uppercase text-muted">Updated</p>
                      <p className="font-mono text-[10px] text-muted">
                        {new Date(g.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Sparkline
                      points={(histories[i] ?? []).slice().reverse().map((r) => Number(r.member_count))}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-line p-10 text-center">
              <p className="text-sm text-muted">
                No servers yet. The bot writes here a few minutes after it starts.
              </p>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">XP Leaderboard</p>
          <div className="border border-line bg-panel">
            {leaderboard.length > 0
              ? leaderboard.map((u, i) => (
                  <LeaderboardRow key={u.user_id} rank={i + 1} user={u} />
                ))
              : (
                <div className="p-10 text-center">
                  <p className="text-sm text-muted">No XP yet — start chatting in Discord.</p>
                </div>
              )
            }
          </div>

          {/* Open tickets callout */}
          {Number(c.open_tickets) > 0 && (
            <div className="mt-4 flex items-center gap-3 border border-amber/20 bg-amber/5 px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-amber animate-pulse flex-shrink-0" />
              <p className="text-sm text-amber">
                {c.open_tickets} open {Number(c.open_tickets) === 1 ? "ticket" : "tickets"} awaiting a response
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
