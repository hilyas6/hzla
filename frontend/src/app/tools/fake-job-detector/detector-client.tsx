"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface Signal {
  feature: string;
  impact: number;
  explanation: string;
}

interface CategorisedPattern {
  name: string;
  icon: string;
  direction: string;
  matched_tokens: string[];
  explanation: string;
}

interface StructuralCheck {
  label: string;
  pass: boolean;
  why: string;
}

interface AnalysisResponse {
  label: string;
  fake_probability: number;
  confidence: string;
  confidence_reasoning: string;
  missing_fields: string[];
  signals: {
    fraud_signals: Signal[];
    legit_signals: Signal[];
  };
  categorised_patterns: CategorisedPattern[];
  structural_checks: StructuralCheck[];
  plain_english_summary: string;
}

const EXAMPLES = {
  suspicious: {
    title: "Remote Data Entry Clerk – Immediate Hire",
    description:
      "Earn up to $800 daily from home with no experience needed. Send your bank details and a copy of your ID for onboarding today. Limited spots available — urgent hiring, guaranteed income, no interview required. Contact us on Telegram now to secure your position.",
  },
  legitimate: {
    title: "Backend Software Engineer",
    description:
      "Bright River Technologies Ltd is seeking a backend engineer with 3+ years of Python experience, REST API design, and PostgreSQL. Full-time role based in London, UK. We offer competitive benefits, a structured interview process, clear responsibilities and a compensation of £65,000 per annum. Apply at https://brightriver.example/careers.",
  },
};

function riskColor(prob: number) {
  if (prob >= 0.65) return "text-red-500";
  if (prob >= 0.4) return "text-yellow-500";
  return "text-emerald-500";
}

function reliabilityColor(bucket: string) {
  if (bucket === "High")
    return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
  if (bucket === "Medium")
    return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
  return "text-red-500 bg-red-500/10 border-red-500/30";
}

export function DetectorClient() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyse() {
    if (!title.trim() || !description.trim()) {
      setError("Please enter both a job title and description.");
      return;
    }
    setError(null);
    setAnalysis(null);
    setLoading(true);

    try {
      const res = await fetch("/api/detector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Server error: ${res.status}`);
      }
      const data: AnalysisResponse = await res.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function loadExample(key: "suspicious" | "legitimate") {
    setTitle(EXAMPLES[key].title);
    setDescription(EXAMPLES[key].description);
    setAnalysis(null);
    setError(null);
  }

  function handleClear() {
    setTitle("");
    setDescription("");
    setAnalysis(null);
    setError(null);
  }

  const pct = analysis ? Math.round(analysis.fake_probability * 100) : 0;
  const isFake = analysis?.label === "fake";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* Input Column */}
      <div className="space-y-5">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Job Posting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-title">Job title</Label>
              <Input
                id="job-title"
                placeholder="e.g. Remote Data Entry Clerk"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-desc">Job description</Label>
              <Textarea
                id="job-desc"
                placeholder="Paste the full job posting here — include title, requirements, salary, and contact details."
                className="min-h-[220px] resize-y"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAnalyse}
                disabled={loading}
                className="flex-1"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Analysing..." : "Analyse Posting"}
              </Button>
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <div className="border-t pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Try an example
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadExample("suspicious")}
                >
                  Suspicious posting
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadExample("legitimate")}
                >
                  Legitimate posting
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Disclaimer:</strong> Automated estimate based on AI
              analysis — not a definitive verdict. Always verify job postings
              independently.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Results Column */}
      <div className="space-y-5">
        {!analysis && !loading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted">
                <ShieldCheckIcon className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold">No analysis yet</p>
              <p className="mt-1 max-w-[200px] text-sm">
                Paste a job posting on the left and click Analyse.
              </p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <Loader2 className="mb-4 h-8 w-8 animate-spin" />
              <p className="text-sm font-medium">Running AI analysis...</p>
            </CardContent>
          </Card>
        )}

        {analysis && (
          <>
            {/* Verdict Card */}
            <Card
              className={`border-l-4 ${
                isFake ? "border-l-red-500" : "border-l-emerald-500"
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {isFake ? (
                      <AlertTriangle className="h-6 w-6 text-red-500" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    )}
                    <div>
                      <p
                        className={`text-lg font-bold ${
                          isFake ? "text-red-500" : "text-emerald-500"
                        }`}
                      >
                        {isFake ? "Likely Fraudulent" : "Likely Legitimate"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isFake
                          ? "Fraud-like patterns detected in this posting."
                          : "No significant fraud patterns detected."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Risk Gauge */}
                <div className="mt-5">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Risk Score
                    </span>
                    <span
                      className={`text-3xl font-extrabold ${riskColor(
                        analysis.fake_probability
                      )}`}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full border-2 border-white bg-foreground shadow-md transition-all duration-500"
                      style={{
                        left: `${Math.max(2, Math.min(98, pct))}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground">
                    <span>Low</span>
                    <span>Uncertain</span>
                    <span>High</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div
                    className={`rounded-lg border p-3 ${reliabilityColor(
                      analysis.confidence
                    )}`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70">
                      Confidence
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      {analysis.confidence}
                    </p>
                    <p className="text-[11px] opacity-80">
                      {analysis.confidence_reasoning}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Powered by
                    </p>
                    <p className="mt-1 text-lg font-bold">Llama 3.3 70B</p>
                    <p className="text-[11px] text-muted-foreground">
                      AI-powered analysis
                    </p>
                  </div>
                </div>

                {/* Missing Fields */}
                {analysis.missing_fields.length > 0 && (
                  <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
                    <strong>Missing details:</strong>{" "}
                    {analysis.missing_fields.join(", ")} — adding these may
                    improve accuracy.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Explanation Tabs */}
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="summary">
                  <TabsList className="w-full">
                    <TabsTrigger value="summary" className="flex-1">
                      Summary
                    </TabsTrigger>
                    <TabsTrigger value="signals" className="flex-1">
                      Signals
                    </TabsTrigger>
                    <TabsTrigger value="checklist" className="flex-1">
                      Checklist
                    </TabsTrigger>
                  </TabsList>

                  {/* Summary Tab */}
                  <TabsContent value="summary" className="mt-4 space-y-4">
                    <div
                      className={`rounded-lg border-l-4 p-4 text-sm leading-relaxed ${
                        isFake
                          ? "border-l-red-500 bg-red-500/5"
                          : "border-l-emerald-500 bg-emerald-500/5"
                      }`}
                    >
                      {analysis.plain_english_summary}
                    </div>

                    {analysis.categorised_patterns.length > 0 && (
                      <div>
                        <p className="mb-3 text-sm font-semibold">
                          Detected Patterns
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {analysis.categorised_patterns.map((cat) => {
                            const isFraud = cat.direction === "fraud";
                            return (
                              <div
                                key={cat.name}
                                className={`rounded-lg border p-4 ${
                                  isFraud
                                    ? "border-red-500/20 bg-red-500/5"
                                    : "border-emerald-500/20 bg-emerald-500/5"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">{cat.icon}</span>
                                  <div>
                                    <p className="text-sm font-semibold">
                                      {cat.name}
                                    </p>
                                    <p
                                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                                        isFraud
                                          ? "text-red-500"
                                          : "text-emerald-500"
                                      }`}
                                    >
                                      {isFraud
                                        ? "Fraud signal"
                                        : "Legitimacy signal"}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                                  {cat.explanation}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {cat.matched_tokens.map((t) => (
                                    <Badge
                                      key={t}
                                      variant="outline"
                                      className={`text-[11px] ${
                                        isFraud
                                          ? "border-red-500/30 text-red-500"
                                          : "border-emerald-500/30 text-emerald-500"
                                      }`}
                                    >
                                      {t}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Signals Tab */}
                  <TabsContent value="signals" className="mt-4 space-y-5">
                    {analysis.signals.fraud_signals.length > 0 && (
                      <div>
                        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-500">
                          <ArrowUp className="h-4 w-4" />
                          Fraud Signals
                        </p>
                        <div className="space-y-2">
                          {analysis.signals.fraud_signals.map((s) => (
                            <SignalRow
                              key={s.feature}
                              signal={s}
                              maxImpact={
                                analysis.signals.fraud_signals[0]?.impact || 1
                              }
                              variant="fraud"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.signals.legit_signals.length > 0 && (
                      <div>
                        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-500">
                          <ArrowDown className="h-4 w-4" />
                          Legitimacy Signals
                        </p>
                        <div className="space-y-2">
                          {analysis.signals.legit_signals.map((s) => (
                            <SignalRow
                              key={s.feature}
                              signal={s}
                              maxImpact={
                                analysis.signals.legit_signals[0]?.impact || 1
                              }
                              variant="legit"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Checklist Tab */}
                  <TabsContent value="checklist" className="mt-4">
                    <p className="mb-4 text-xs text-muted-foreground">
                      Structural checks applied to the posting content.
                    </p>
                    <div className="space-y-2">
                      {analysis.structural_checks.map((check) => (
                        <div
                          key={check.label}
                          className={`flex items-start gap-3 rounded-lg border p-3 ${
                            check.pass
                              ? "border-emerald-500/20 bg-emerald-500/5"
                              : "border-red-500/20 bg-red-500/5"
                          }`}
                        >
                          <span className="mt-0.5 text-base">
                            {check.pass ? "✅" : "❌"}
                          </span>
                          <div>
                            <p className="text-sm font-semibold">
                              {check.label}
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {check.why}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function SignalRow({
  signal,
  maxImpact,
  variant,
}: {
  signal: Signal;
  maxImpact: number;
  variant: "fraud" | "legit";
}) {
  const width =
    maxImpact > 0
      ? Math.max(8, (Math.abs(signal.impact) / maxImpact) * 100)
      : 8;

  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-3 mb-1.5">
        <span className="text-sm font-semibold">{signal.feature}</span>
        <Badge
          variant="outline"
          className={`text-[10px] ml-auto ${
            variant === "fraud"
              ? "border-red-500/30 text-red-500"
              : "border-emerald-500/30 text-emerald-500"
          }`}
        >
          {(signal.impact * 100).toFixed(0)}% impact
        </Badge>
      </div>
      <div className="relative h-1.5 w-full rounded-full bg-muted mb-1.5">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${
            variant === "fraud" ? "bg-red-500/60" : "bg-emerald-500/60"
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {signal.explanation}
      </p>
    </div>
  );
}
