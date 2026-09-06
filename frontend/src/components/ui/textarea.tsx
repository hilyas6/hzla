import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full border border-input bg-input/40 px-2.5 py-2 text-base text-foreground transition-colors outline-none [clip-path:var(--clip-poly-sm)] placeholder:text-muted-foreground focus-visible:border-neon-cyan focus-visible:bg-[color-mix(in_srgb,var(--neon-cyan)_6%,transparent)] focus-visible:shadow-neon-cyan disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
