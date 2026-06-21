"use client";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const CLIENT_ID     = "1456027240977399818";
const BOT_INVITE    = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;
const DISCORD_JOIN  = "https://discord.gg/yobest";

const NAV_LINKS = [
  { href: "/",            label: "Home"     },
  { href: "/games",       label: "Games"    },
  { href: "/dashboard",   label: "Dashboard"},
  { href: "/ai",          label: "AI Chat",  accent: "signal" },
];

export default function Nav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open,    setOpen]    = useState(false);
  const [scrolled,setScrolled]= useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className={`sticky top-0 z-50 border-b border-line transition-all ${
      scrolled ? "bg-ink/95 backdrop-blur-md shadow-lg shadow-black/40" : "bg-ink"
    }`}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-base font-bold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center border border-signal/40 bg-signal/10 font-mono text-xs font-bold text-signal">Y</span>
          <span className="text-paper">YOBEST</span>
          <span className="text-signal">STUDIO</span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label, accent }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={`rounded px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                  active
                    ? "bg-signal/10 text-signal"
                    : accent === "signal"
                    ? "text-signal/70 hover:text-signal hover:bg-signal/10"
                    : "text-muted hover:text-paper hover:bg-raised"
                }`}>
                {label}
              </Link>
            );
          })}
          {session && (
            <Link href="/bot-control"
              className={`rounded px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                pathname.startsWith("/bot-control")
                  ? "bg-amber/10 text-amber"
                  : "text-amber/70 hover:text-amber hover:bg-amber/10"
              }`}>
              ⚙ Control Panel
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="hidden items-center gap-2 md:flex">
          <a href={BOT_INVITE} target="_blank" rel="noreferrer"
             className="rounded border border-signal/30 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-signal/80 transition hover:border-signal hover:bg-signal/10 hover:text-signal">
            + Add Bot
          </a>

          {status === "loading" ? (
            <div className="h-8 w-8 animate-pulse rounded border border-line bg-raised" />
          ) : session ? (
            <UserMenu session={session} />
          ) : (
            <button onClick={() => signIn("discord")}
              className="flex items-center gap-2 rounded border border-line bg-[#5865F2]/10 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[#5865F2] transition hover:bg-[#5865F2]/20 hover:border-[#5865F2]/50">
              <svg width="14" height="14" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z"/>
              </svg>
              Link Discord
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)}
          className="flex h-8 w-8 items-center justify-center rounded border border-line text-muted transition hover:border-signal/50 hover:text-paper md:hidden">
          {open
            ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l12 12M13 1L1 13"/></svg>
            : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 3h12M1 7h12M1 11h12"/></svg>
          }
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line bg-panel px-4 py-3 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href}
                className="rounded px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted transition hover:bg-raised hover:text-paper">
                {label}
              </Link>
            ))}
            {session && (
              <Link href="/bot-control"
                className="rounded px-3 py-2 font-mono text-xs uppercase tracking-wider text-amber/80 transition hover:bg-raised hover:text-amber">
                ⚙ Control Panel
              </Link>
            )}
            <div className="mt-2 flex flex-col gap-2 border-t border-line pt-2">
              <a href={BOT_INVITE} target="_blank" rel="noreferrer"
                 className="rounded border border-signal/30 px-3 py-2 text-center font-mono text-xs uppercase text-signal">
                + Add Bot to Server
              </a>
              {session
                ? <button onClick={() => signOut()}
                    className="rounded border border-line px-3 py-2 font-mono text-xs uppercase text-muted">
                    Sign Out
                  </button>
                : <button onClick={() => signIn("discord")}
                    className="rounded bg-[#5865F2]/20 px-3 py-2 font-mono text-xs uppercase text-[#5865F2]">
                    Link Discord Account
                  </button>
              }
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function UserMenu({ session }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded border border-line px-2 py-1 transition hover:border-signal/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={session.user.avatar} alt="" className="h-5 w-5 rounded-full" />
        <span className="max-w-[100px] truncate font-mono text-xs text-paper">{session.user.name}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
          <path d="M2 4l3 3 3-3"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 border border-line bg-panel shadow-xl animate-fade-in">
          <Link href="/bot-control"
            className="flex items-center gap-2 px-4 py-3 font-mono text-xs text-muted transition hover:bg-raised hover:text-paper"
            onClick={() => setOpen(false)}>
            ⚙ Control Panel
          </Link>
          <button onClick={() => { signOut(); setOpen(false); }}
            className="flex w-full items-center gap-2 px-4 py-3 font-mono text-xs text-muted transition hover:bg-raised hover:text-paper">
            ↩ Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
