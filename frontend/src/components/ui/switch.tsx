"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 items-center border border-[var(--neon-cyan)]/30 bg-muted p-0.5 transition-colors outline-none [clip-path:var(--clip-poly-sm)] focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-neon-cyan data-[checked]:bg-[color-mix(in_srgb,var(--neon-cyan)_30%,transparent)]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="block h-3.5 w-3.5 bg-foreground transition-transform data-[checked]:translate-x-4 data-[checked]:bg-neon-cyan"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
