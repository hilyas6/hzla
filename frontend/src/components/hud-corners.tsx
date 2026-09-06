import { cn } from "@/lib/utils";

export function HudCorners({ className }: { className?: string }) {
  return (
    <>
      <span
        className={cn(
          "pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2",
          className
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2",
          className
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2",
          className
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2",
          className
        )}
      />
    </>
  );
}
