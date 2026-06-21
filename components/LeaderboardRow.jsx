export default function LeaderboardRow({ rank, user }) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  return (
    <div className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0 hover:bg-raised/50 transition-colors">
      <span className="w-7 text-center font-mono text-sm text-muted flex-shrink-0">
        {medal ?? <span className="text-xs">#{rank}</span>}
      </span>
      {user.avatar_url
        /* eslint-disable-next-line @next/next/no-img-element */
        ? <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full border border-line flex-shrink-0" />
        : <div className="h-8 w-8 rounded-full border border-line bg-raised flex-shrink-0" />
      }
      <span className="flex-1 truncate text-sm text-paper font-medium">
        {user.username ?? user.user_id}
      </span>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="font-mono text-xs text-muted">Lv.{user.level}</span>
        <span className="font-mono text-xs font-bold text-signal">
          {Number(user.xp).toLocaleString()} XP
        </span>
      </div>
    </div>
  );
}
