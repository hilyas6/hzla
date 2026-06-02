import { ToolCard } from "@/components/tool-card";
import { ShieldCheck, FileText, Wand2, Wrench } from "lucide-react";

const tools = [
  {
    title: "Fake Job Detector",
    description:
      "Paste any job posting and our AI model will analyse it for fraud signals, giving you a risk score with a full explainability report.",
    href: "/tools/fake-job-detector",
    icon: <ShieldCheck className="h-5 w-5" />,
    status: "live" as const,
  },
  {
    title: "Application Tracker",
    description:
      "Keep track of every job you apply to — status, deadlines, notes, and follow-ups — all in one place.",
    href: "/tools/application-tracker",
    icon: <FileText className="h-5 w-5" />,
    status: "coming-soon" as const,
  },
  {
    title: "Auto Filler",
    description:
      "Automatically fill out job application forms using your saved profile and CV data.",
    href: "/tools/auto-filler",
    icon: <Wand2 className="h-5 w-5" />,
    status: "coming-soon" as const,
  },
  {
    title: "More Tools",
    description:
      "We are building more AI-powered tools to help job seekers. Stay tuned for updates.",
    href: "#",
    icon: <Wrench className="h-5 w-5" />,
    status: "coming-soon" as const,
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="flex flex-col items-center pt-24 pb-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Open-source &middot; Free to use
        </div>

        <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight sm:text-6xl">
          AI-powered tools for
          <span className="bg-gradient-to-r from-neutral-500 to-neutral-900 bg-clip-text text-transparent dark:from-neutral-400 dark:to-white">
            {" "}
            smarter job hunting
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          HZLA is a growing collection of tools that help you spot scams, stay
          organised, and save time throughout your job search.
        </p>
      </section>

      {/* Tool Grid */}
      <section className="pb-28">
        <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Tools
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => (
            <ToolCard key={tool.title} {...tool} />
          ))}
        </div>
      </section>
    </div>
  );
}
