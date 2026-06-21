import Link from "next/link";

export default function Nav() {
  return (
    <nav className="border-b border-line bg-ink sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl font-bold text-paper">YOBEST STUDIO</Link>
        <div className="flex gap-8 text-sm">
          <Link href="/games" className="hover:text-signal transition">Games</Link>
          <Link href="/dashboard" className="hover:text-signal transition">Dashboard</Link>
          <a href="https://discord.gg/yobest" className="hover:text-signal transition">Discord</a>
        </div>
      </div>
    </nav>
  );
}
