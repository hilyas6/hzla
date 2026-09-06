import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border border-transparent px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider whitespace-nowrap uppercase transition-all [clip-path:var(--clip-poly-sm)] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "border-neon-cyan bg-[color-mix(in_srgb,var(--neon-cyan)_14%,transparent)] text-neon-cyan shadow-neon-cyan [a]:hover:bg-[color-mix(in_srgb,var(--neon-cyan)_24%,transparent)]",
        secondary:
          "border-dashed border-neon-pink bg-transparent text-neon-pink [a]:hover:bg-[color-mix(in_srgb,var(--neon-pink)_12%,transparent)]",
        destructive:
          "border-[var(--destructive)]/50 bg-[color-mix(in_srgb,var(--destructive)_14%,transparent)] text-[var(--destructive)] focus-visible:ring-destructive/20 [a]:hover:bg-[color-mix(in_srgb,var(--destructive)_24%,transparent)]",
        outline:
          "border-border bg-transparent text-foreground [a]:hover:bg-white/5",
        ghost:
          "border-transparent text-muted-foreground hover:bg-white/5",
        link: "border-transparent bg-transparent p-0 text-neon-cyan underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
