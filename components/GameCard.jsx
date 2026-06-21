export default function GameCard({ game }) {
  return (
    <article className="group border border-line bg-panel transition hover:border-signal/40">
      <div className="aspect-video w-full overflow-hidden border-b border-line bg-ink">
        {game.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={game.image_url} alt={game.title}
               className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-widest text-muted">
            No cover
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-base font-semibold text-paper">{game.title}</h3>
        {game.description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{game.description}</p>
        )}
        {game.play_url && (
          <a href={game.play_url} target="_blank" rel="noreferrer"
             className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-signal transition hover:gap-2.5">
            Play on Roblox
            <span aria-hidden>→</span>
          </a>
        )}
      </div>
    </article>
  );
}
