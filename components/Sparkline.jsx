export default function Sparkline({ points }) {
  if (!points || points.length < 2) return <div className="h-20 bg-line/30" />;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const pathPoints = points.map((v, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  });

  return (
    <svg viewBox="0 0 100 40" className="w-full h-20 overflow-visible">
      <polyline
        points={pathPoints.join(" ")}
        fill="none"
        stroke="#00ff9f"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
