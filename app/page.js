import { safeQuery, dbConfigured } from "@/lib/db";
import StatusStrip from "@/components/StatusStrip";
import Sparkline from "@/components/Sparkline";
import LeaderboardRow from "@/components/LeaderboardRow";

export const revalidate = 15;

export default async function DashboardPage() {
  if (!dbConfigured) {
    return (
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl border border-dashed border-line p-10 text-center text-dim">
          The dashboard needs <code className="font-mono text-paper">DATABASE_URL</code> set to your Neon
          connection string before it has anything to show.
        </div>
      </section>
    );
  }

  const [guilds, leaderboard, countsRows] = await Promise.all([
    safeQuery(
      (sql) =>
        sql`SELECT guild_id, name, icon_url, member_count, boost_level, boost_count, updated_at FROM guilds ORDER BY member_count DESC`
    ),
    safeQuery(
      (sql) => sql`SELECT user_id, username, avatar_url, xp, level FROM xp ORDER BY level DESC, xp DESC LIMIT 10`
    ),
    safeQuery(
      (sql) => sql`SELECT
        (SELECT COUNT(*) FROM tickets WHERE status = 'open') AS open_tickets,
        (SELECT COUNT(*) FROM custom_commands) AS custom_commands,
        (SELECT COUNT(*) FROM games WHERE status = 'live') AS live_games`
    ),
  ]);

  const histories = await Promise.all(
    guilds.map((g) =>
      safeQuery(
        (sql) =>
          sql`SELECT member_count, captured_at FROM guild_stats_history WHERE guild_id = ${g.guild_id} ORDER BY captured_at DESC LIMIT 30`
      )
    )
  );

  const totalMembers = guilds.reduce((sum, g) => sum + Number(g.member_count || 0), 0);
  const lastSeen = guilds.reduce((latest, g) => {
    const t = new Date(g.updated_at).getTime();
    return t > latest ? t : latest;
  }, 0);
  const online = lastSeen ? Date.now() - lastSeen < 10 * 60_000 : false;
  const counts = countsRows[0] || {};

  const statCards = [
    ["Members", totalMembers.toLocaleString()],
    ["Open Tickets", counts.open_tickets ?? 0],
    ["Live Games", counts.live_games ?? 0],
    ["Custom Commands", counts.custom_commands ?? 0],
  ];

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-wider text-signal">Live</p>
        <h1 className="mb-6 font-display text-4xl text-paper">Dashboard</h1>
        <StatusStrip online={online} totalMembers={totalMembers} guildCount={guilds.length} />

        <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-4">
          {statCards.map(([label, value]) => (
            <div key={label} className="bg-ink p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-dim">{label}</p>
              <p className="mt-2 font-display text-3xl text-paper">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-wider text-dim">Servers</p>
            <div className="space-y-4">
              {guilds.length ? (
                guilds.map((g, i) => (
                  <div key={g.guild_id} className="border border-line bg-panel p-5">
                    <div className="flex items-center gap-3">
                      {g.icon_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={g.icon_url} alt="" className="h-9 w-9 rounded-full border border-line" />
                      ) : (
                        <div className="h-9 w-9 rounded-full border border-line bg-ink" />
                      )}
                      <div>
                        <p className="text-sm text-paper">{g.name}</p>
                        <p className="font-mono text-xs text-dim">
                          {Number(g.member_count).toLocaleString()} members · boost {g.boost_level}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Sparkline points={(histories[i] || []).slice().reverse().map((r) => Number(r.member_count))} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="border border-dashed border-line p-8 text-center text-dim">
                  No servers reporting yet — the bot writes here a few minutes after it starts.
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-wider text-dim">XP Leaderboard</p>
            <div className="border border-line bg-panel">
              {leaderboard.length ? (
                leaderboard.map((u, i) => <LeaderboardRow key={u.user_id} rank={i + 1} user={u} />)
              ) : (
                <div className="p-8 text-center text-dim">No XP logged yet — start chatting in Discord.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
