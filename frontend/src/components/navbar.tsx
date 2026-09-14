"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { CircleUserRound, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AVATAR_UPDATED_EVENT } from "@/lib/avatar-events";

function ProfileAvatar({ avatarPath }: { avatarPath: string | null }) {
  if (!avatarPath) return <CircleUserRound className="h-5 w-5" />;
  return (
    <Image
      src={`/api/avatar/${avatarPath}`}
      alt="Profile"
      width={24}
      height={24}
      className="h-6 w-6 rounded-full object-cover"
      unoptimized
    />
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setAvatarPath(null);
      return;
    }
    function loadAvatar() {
      fetch("/api/account/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setAvatarPath(data?.avatarPath ?? null))
        .catch(() => {});
    }
    loadAvatar();
    window.addEventListener(AVATAR_UPDATED_EVENT, loadAvatar);
    return () => window.removeEventListener(AVATAR_UPDATED_EVENT, loadAvatar);
  }, [session]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--neon-cyan)]/15 bg-background/85 backdrop-blur-xl">
      <div className="absolute inset-x-0 bottom-[-1px] h-px bg-gradient-to-r from-transparent via-[var(--neon-cyan)]/70 to-transparent" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <div className="flex h-8 w-8 items-center justify-center bg-[var(--neon-yellow)] text-[var(--primary-foreground)] shadow-neon-yellow transition-transform [clip-path:var(--clip-poly-sm)] group-hover:scale-105">
            <span className="font-display text-sm font-black tracking-tight">
              Hz
            </span>
          </div>
          <span className="font-display text-lg font-bold tracking-widest text-foreground">
            HZLA
          </span>
        </Link>

        <nav className="hidden items-center gap-6 font-mono text-xs uppercase tracking-widest text-muted-foreground md:flex">
          <Link
            href="https://github.com/hilyas6/hzla"
            target="_blank"
            className="transition hover:text-neon-cyan hover:glow-text-cyan"
          >
            GitHub
          </Link>
          {session ? (
            <Link
              href="/dashboard"
              aria-label="Dashboard"
              className="flex items-center text-foreground transition hover:text-neon-cyan hover:glow-text-cyan"
            >
              <ProfileAvatar avatarPath={avatarPath} />
            </Link>
          ) : (
            <div className="flex items-center gap-2 normal-case">
              <Button render={<Link href="/login" />} variant="outline" size="sm">
                Log In
              </Button>
              <Button render={<Link href="/signup" />} size="sm">
                Sign Up
              </Button>
            </div>
          )}
          <span className="hidden items-center gap-2 border border-[var(--neon-green)]/40 px-2.5 py-1 text-[10px] text-neon-green sm:flex [clip-path:var(--clip-poly-sm)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--neon-green)] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--neon-green)]" />
            </span>
            Online
          </span>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          {session && (
            <Link
              href="/dashboard"
              aria-label="Dashboard"
              className="flex items-center text-foreground"
              onClick={() => setOpen(false)}
            >
              <ProfileAvatar avatarPath={avatarPath} />
            </Link>
          )}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center text-foreground"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-[var(--neon-cyan)]/15 bg-background/95 px-6 py-4 font-mono text-sm uppercase tracking-widest md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              href="https://github.com/hilyas6/hzla"
              target="_blank"
              className="text-muted-foreground transition hover:text-neon-cyan"
              onClick={() => setOpen(false)}
            >
              GitHub
            </Link>
            {!session && (
              <div className="flex flex-col gap-2 normal-case">
                <Button
                  render={<Link href="/login" onClick={() => setOpen(false)} />}
                  variant="outline"
                  className="w-full justify-center"
                >
                  Log In
                </Button>
                <Button
                  render={<Link href="/signup" onClick={() => setOpen(false)} />}
                  className="w-full justify-center"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
