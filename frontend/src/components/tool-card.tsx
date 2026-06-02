import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <Card
      className={`group relative overflow-hidden transition-all duration-300 ${
        isLive
          ? "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
          : "opacity-60 cursor-default"
      }`}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground">
            {icon}
          </div>
          <Badge variant={isLive ? "default" : "secondary"}>
            {isLive ? "Live" : "Coming Soon"}
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
  );

  if (!isLive) return content;
  return <Link href={href}>{content}</Link>;
}
