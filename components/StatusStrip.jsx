export default function StatusStrip({ online, totalMembers, guildCount }) {
  return (
    <div className="font-mono text-xs flex items-center gap-3 text-signal border border-line bg-ink px-4 py-2 w-fit">
      <span>● {online ? "BOT ONLINE" : "BOT OFFLINE"}</span>
      <span className="text-dim">·</span>
      <span>{totalMembers.toLocaleString()} MEMBERS</span>
      <span className="text-dim">·</span>
      <span>{guildCount} SERVERS</span>
    </div>
  );
}
