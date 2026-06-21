import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink py-12">
      <div className="max-w-6xl mx-auto px-6 text-center text-dim text-sm">
        <p>© Yobest Studio • Built live from Discord</p>
        <div className="mt-4 flex justify-center gap-6 text-xs">
          <Link href="/" className="hover:text-paper">Home</Link>
          <Link href="/games" className="hover:text-paper">Games</Link>
          <Link href="/dashboard" className="hover:text-paper">Dashboard</Link>
        </div>
      </div>
    </footer>
  );
}
