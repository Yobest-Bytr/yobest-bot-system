import { safeQuery, dbConfigured } from "@/lib/db";
import GameCard from "@/components/GameCard";

export const revalidate = 30;
export const metadata = { title: "Games" };

export default async function GamesPage() {
  const games = await safeQuery((sql) => sql`
    SELECT title, description, play_url, image_url
    FROM games WHERE status = 'live'
    ORDER BY created_at DESC`);

  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Yobest Studio</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-paper">Games</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          Every Roblox title we've shipped. Admins publish here directly from Discord
          with <code>/addgame</code> — no CMS, no deploys.
        </p>
      </div>

      {games.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => <GameCard key={game.title} game={game} />)}
        </div>
      ) : (
        <div className="border border-dashed border-line p-16 text-center">
          <p className="text-2xl">🎮</p>
          <p className="mt-3 font-display text-sm font-semibold text-paper">No games yet</p>
          <p className="mt-1 text-sm text-muted">
            {dbConfigured
              ? <>Use <code>/addgame</code> in Discord to publish your first title.</>
              : <>Set <code>DATABASE_URL</code> in Vercel to connect this page to the bot.</>}
          </p>
        </div>
      )}
    </section>
  );
}
