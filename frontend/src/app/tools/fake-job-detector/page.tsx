import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Fake Job Detector",
  description: "AI-powered tool to detect fraudulent job postings.",
};

export default function FakeJobDetector() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Fake Job Detector
        </h1>
        <Badge>Live</Badge>
      </div>
      <p className="text-muted-foreground mb-10 max-w-xl">
        Paste a job posting below and our TextGCN model will analyse it for
        fraud patterns, returning a risk score with full explainability.
      </p>

      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-lg font-medium mb-2">Full UI coming soon</p>
        <p className="text-sm">
          The detection backend is live. This page will be wired up to the
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
            /api/detector/predict
          </code>
          and
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
            /api/detector/explain
          </code>
          endpoints.
        </p>
      </div>
    </div>
  );
}
