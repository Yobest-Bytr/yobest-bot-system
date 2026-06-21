export default function Sparkline({ points = [], width = 300, height = 48 }) {
  if (points.length < 2) {
    return <p className="font-mono text-[10px] uppercase tracking-wider text-muted py-3">Collecting history…</p>;
  }
  const max  = Math.max(...points);
  const min  = Math.min(...points);
  const rng  = max - min || 1;
  const step = width / (points.length - 1);
  const y    = (p) => height - ((p - min) / rng) * (height - 4) - 2;
  const coords = points.map((p, i) => [i * step, y(p)]);
  const line   = coords.map(([x, yv], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${yv.toFixed(1)}`).join(" ");
  const area   = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible" style={{ height: 48 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#00e5a0" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#00e5a0" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)" />
      <path d={line}  fill="none" stroke="#00e5a0" strokeWidth="1.5" strokeLinecap="round"/>
      {/* last data point dot */}
      <circle cx={coords[coords.length-1][0]} cy={coords[coords.length-1][1]} r="3" fill="#00e5a0"/>
    </svg>
  );
}
