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
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Fake Job Detector
        </h1>
        <Badge>Live</Badge>
      </div>
      <p className="text-muted-foreground mb-8 max-w-xl">
        Paste a job posting below and our TextGCN model will analyse it for
        fraud patterns, returning a risk score with full explainability.
      </p>

      <DetectorClient />
    </div>
  );
}
