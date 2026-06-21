import Image from "next/image";

export default function GameCard({ game }) {
  return (
    <a
      href={game.play_url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border border-line bg-panel overflow-hidden hover:border-signal transition"
    >
      {game.image_url && (
        <div className="relative h-48">
          <Image
            src={game.image_url}
            alt={game.title}
            fill
            className="object-cover group-hover:scale-105 transition"
          />
        </div>
      )}
      <div className="p-5">
        <h3 className="font-display text-xl text-paper">{game.title}</h3>
        {game.description && <p className="mt-2 text-sm text-dim line-clamp-3">{game.description}</p>}
        {game.play_url && (
          <div className="mt-4 text-signal text-xs font-mono tracking-wider">PLAY ON ROBLOX →</div>
        )}
      </div>
    </a>
  );
}
