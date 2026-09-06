export function Footer() {
  return (
    <footer className="relative border-t border-[var(--neon-cyan)]/15 py-8">
      <div className="absolute inset-x-0 top-[-1px] h-px bg-gradient-to-r from-transparent via-[var(--neon-cyan)]/50 to-transparent" />
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <span className="text-neon-cyan">&#47;&#47;</span> HZLA &copy;{" "}
          {new Date().getFullYear()}
          <span className="text-neon-cyan"> &mdash; </span>
          All systems nominal
        </p>
      </div>
    </footer>
  );
}
