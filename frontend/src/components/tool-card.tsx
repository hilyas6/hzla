import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HudCorners } from "@/components/hud-corners";

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  status: "live" | "coming-soon";
}

export function ToolCard({
  title,
  description,
  href,
  icon,
  status,
}: ToolCardProps) {
  const isLive = status === "live";

  const content = (
    <div className={isLive ? "gradient-spin-border" : undefined}>
      <Card
        className={`group relative transition-all duration-300 ${
          isLive
            ? "cursor-pointer hover:-translate-y-1 hover:ring-[var(--neon-cyan)]/40"
            : "cursor-default opacity-50"
        }`}
      >
        <HudCorners
          className={
            isLive ? "border-neon-cyan" : "border-muted-foreground/30"
          }
        />
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div
              className={`flex h-11 w-11 items-center justify-center [clip-path:var(--clip-poly-sm)] ${
                isLive
                  ? "bg-[color-mix(in_srgb,var(--neon-cyan)_14%,transparent)] text-neon-cyan"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {icon}
            </div>
            <Badge variant={isLive ? "default" : "secondary"}>
              {isLive ? "Live" : "Soon"}
            </Badge>
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="mt-1.5 text-sm leading-relaxed">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );

  if (!isLive) return content;
  return <Link href={href}>{content}</Link>;
}
