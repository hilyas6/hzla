import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DetectorClient } from "./detector-client";

export const metadata: Metadata = {
  title: "Fake Job Detector",
  description: "AI-powered tool to detect fraudulent job postings.",
};

export default function FakeJobDetector() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[color-mix(in_srgb,var(--neon-cyan)_14%,transparent)] text-neon-cyan shadow-neon-cyan [clip-path:var(--clip-poly-sm)]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="font-display text-2xl font-black uppercase tracking-wide sm:text-3xl">
          Fake Job Detector
        </h1>
      </div>
      <div className="mb-2">
        <Badge>Live</Badge>
      </div>
      <p className="text-muted-foreground mb-8 max-w-xl">
        Paste a job posting below and our AI model will analyse it for
        fraud patterns, returning a risk score with full explainability.
      </p>

      <DetectorClient />
    </div>
  );
}
