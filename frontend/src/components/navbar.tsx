import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--neon-cyan)]/15 bg-background/85 backdrop-blur-xl">
      <div className="absolute inset-x-0 bottom-[-1px] h-px bg-gradient-to-r from-transparent via-[var(--neon-cyan)]/70 to-transparent" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center bg-[var(--neon-yellow)] text-[var(--primary-foreground)] shadow-neon-yellow transition-transform [clip-path:var(--clip-poly-sm)] group-hover:scale-105">
            <span className="font-display text-sm font-black tracking-tight">
              Hz
            </span>
          </div>
          <span className="font-display text-lg font-bold tracking-widest text-foreground">
            HZLA
          </span>
        </Link>

        <nav className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <Link
            href="/tools"
            className="transition hover:text-neon-cyan hover:glow-text-cyan"
          >
            Tools
          </Link>
          <Link
            href="https://github.com/hilyas6/hzla"
            target="_blank"
            className="transition hover:text-neon-cyan hover:glow-text-cyan"
          >
            GitHub
          </Link>
          <span className="hidden items-center gap-2 border border-[var(--neon-green)]/40 px-2.5 py-1 text-[10px] text-neon-green sm:flex [clip-path:var(--clip-poly-sm)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--neon-green)] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--neon-green)]" />
            </span>
            Online
          </span>
        </nav>
      </div>
    </header>
  );
}
