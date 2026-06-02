import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <span className="text-sm font-black tracking-tight text-background">
              Hz
            </span>
          </div>
          <span className="text-lg font-bold tracking-tight">HZLA</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/tools" className="transition hover:text-foreground">
            Tools
          </Link>
          <Link href="https://github.com/hilyas6/hzla" target="_blank" className="transition hover:text-foreground">
            GitHub
          </Link>
        </nav>
      </div>
    </header>
  );
}
