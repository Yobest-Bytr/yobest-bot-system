"use client";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

export default function HeroCTA({ discordJoin, botInvite }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-11 w-64 animate-pulse border border-line bg-raised" />;
  }

  if (!session) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={() => signIn("discord")}
          className="inline-flex items-center gap-2 bg-signal px-5 py-2.5 font-display text-sm font-semibold text-ink transition hover:bg-signal/85"
        >
          Connect with Discord
        </button>
        <a href={discordJoin} target="_blank" rel="noreferrer"
           className="font-mono text-xs uppercase tracking-wider text-muted transition hover:text-paper">
          Join our server →
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <a href={botInvite} target="_blank" rel="noreferrer"
         className="inline-flex items-center gap-2 bg-signal px-5 py-2.5 font-display text-sm font-semibold text-ink transition hover:bg-signal/85">
        + Add Bot to Your Server
      </a>
      <Link href="/bot-control"
         className="inline-flex items-center gap-2 border border-signal/40 px-5 py-2.5 font-display text-sm font-semibold text-signal transition hover:border-signal hover:bg-signal/10">
        Open Control Panel
      </Link>
      <Link href="/games"
         className="font-mono text-xs uppercase tracking-wider text-muted transition hover:text-paper">
        Browse games →
      </Link>
    </div>
  );
}
