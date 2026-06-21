export default function LeaderboardRow({ rank, user }) {
  return (
    <div className="flex items-center gap-4 border-b border-line last:border-0 px-6 py-4 hover:bg-signal/5 transition">
      <div className="w-8 font-mono text-signal">{rank}</div>
      <div className="flex-1 flex items-center gap-3">
        {user.avatar_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
        )}
        <div>
          <div className="text-paper">{user.username || user.user_id}</div>
          <div className="text-xs text-dim">Level {user.level}</div>
        </div>
      </div>
      <div className="font-mono text-signal text-right">{user.xp} XP</div>
    </div>
  );
}
