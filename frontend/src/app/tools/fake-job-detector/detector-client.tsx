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
  Info,
} from "lucide-react";

interface PredictResponse {
  label: string;
  fake_probability: number;
  real_probability: number;
  confidence: number;
  threshold: number;
  ci_low: number;
  ci_high: number;
  reliability_bucket: string;
  reliability_msg: string;
  missing_fields: string[];
  text_length: number;
  model_signature: string;
}

interface ExplainResponse {
  top_increase_fake: { feature: string; impact: number }[];
  top_decrease_fake: { feature: string; impact: number }[];
  audit_top_increase_fake: { feature: string; impact: number }[];
  audit_top_decrease_fake: { feature: string; impact: number }[];
  categorised_signals: {
    name: string;
    icon: string;
    direction: string;
    matched_tokens: string[];
    explanation: string;
    total_impact: number;
  }[];
  structural_checks: { label: string; pass: boolean; why: string }[];
  plain_english_summary: string;
  shap_error: string | null;
  mode: string;
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

function riskBg(prob: number) {
  if (prob >= 0.65) return "bg-red-500";
  if (prob >= 0.4) return "bg-yellow-500";
  return "bg-emerald-500";
}

function reliabilityColor(bucket: string) {
  if (bucket === "High") return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
  if (bucket === "Medium") return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
  return "text-red-500 bg-red-500/10 border-red-500/30";
}

export function DetectorClient() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyse() {
    if (!title.trim() || !description.trim()) {
      setError("Please enter both a job title and description.");
      return;
    }
    setError(null);
    setPrediction(null);
    setExplanation(null);
    setLoading(true);

    try {
      const res = await fetch("/api/detector/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: PredictResponse = await res.json();
      setPrediction(data);

      // Auto-fetch explanation
      setExplainLoading(true);
      const explainRes = await fetch("/api/detector/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, mode: "fast" }),
      });
      if (explainRes.ok) {
        setExplanation(await explainRes.json());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
      setExplainLoading(false);
    }
  }

  function loadExample(key: "suspicious" | "legitimate") {
    setTitle(EXAMPLES[key].title);
    setDescription(EXAMPLES[key].description);
    setPrediction(null);
    setExplanation(null);
    setError(null);
  }

  function handleClear() {
    setTitle("");
    setDescription("");
    setPrediction(null);
    setExplanation(null);
    setError(null);
  }

  const pct = prediction ? Math.round(prediction.fake_probability * 100) : 0;
  const isFake = prediction?.label === "fake";

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
              <strong>Disclaimer:</strong> Automated estimate based on language
              patterns — not a definitive verdict. Always verify job postings
              independently.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Results Column */}
      <div className="space-y-5">
        {!prediction && !loading && (
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
              <p className="text-sm font-medium">
                Running model inference...
              </p>
            </CardContent>
          </Card>
        )}

        {prediction && (
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
                    <span className={`text-3xl font-extrabold ${riskColor(prediction.fake_probability)}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full border-2 border-white bg-foreground shadow-md transition-all duration-500"
                      style={{ left: `${Math.max(2, Math.min(98, pct))}%` }}
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
                  <div className="rounded-lg border bg-muted/50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Confidence Range
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      {Math.round(prediction.ci_low * 100)}% –{" "}
                      {Math.round(prediction.ci_high * 100)}%
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      10th – 90th percentile
                    </p>
                  </div>
                  <div
                    className={`rounded-lg border p-3 ${reliabilityColor(
                      prediction.reliability_bucket
                    )}`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70">
                      Reliability
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      {prediction.reliability_bucket}
                    </p>
                    <p className="text-[11px] opacity-80">
                      {prediction.reliability_msg}
                    </p>
                  </div>
                </div>

                {/* Missing Fields */}
                {prediction.missing_fields.length > 0 && (
                  <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
                    <strong>Missing details:</strong>{" "}
                    {prediction.missing_fields.join(", ")} — adding these may
                    improve accuracy.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Explanation Tabs */}
            {explainLoading && (
              <Card>
                <CardContent className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading explanation...</span>
                </CardContent>
              </Card>
            )}

            {explanation && (
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
                        dangerouslySetInnerHTML={{
                          __html: explanation.plain_english_summary,
                        }}
                      />

                      {explanation.categorised_signals.length > 0 && (
                        <div>
                          <p className="mb-3 text-sm font-semibold">
                            Detected Patterns
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {explanation.categorised_signals.map((cat) => {
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
                      {explanation.top_increase_fake.length > 0 && (
                        <div>
                          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-500">
                            <ArrowUp className="h-4 w-4" />
                            Pushing toward Fraudulent
                          </p>
                          <div className="space-y-1.5">
                            {explanation.top_increase_fake
                              .slice(0, 8)
                              .map((s) => (
                                <SignalBar
                                  key={s.feature}
                                  feature={s.feature}
                                  impact={s.impact}
                                  maxImpact={
                                    explanation.top_increase_fake[0]?.impact || 1
                                  }
                                  variant="fraud"
                                />
                              ))}
                          </div>
                        </div>
                      )}

                      {explanation.top_decrease_fake.length > 0 && (
                        <div>
                          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-500">
                            <ArrowDown className="h-4 w-4" />
                            Pushing toward Legitimate
                          </p>
                          <div className="space-y-1.5">
                            {explanation.top_decrease_fake
                              .slice(0, 8)
                              .map((s) => (
                                <SignalBar
                                  key={s.feature}
                                  feature={s.feature}
                                  impact={s.impact}
                                  maxImpact={
                                    explanation.top_decrease_fake[0]?.impact || 1
                                  }
                                  variant="legit"
                                />
                              ))}
                          </div>
                        </div>
                      )}

                      {explanation.shap_error && (
                        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
                          <Info className="mr-2 inline h-4 w-4" />
                          {explanation.shap_error}
                        </div>
                      )}
                    </TabsContent>

                    {/* Checklist Tab */}
                    <TabsContent value="checklist" className="mt-4">
                      <p className="mb-4 text-xs text-muted-foreground">
                        Structural checks applied to the raw text — independent
                        of the ML model.
                      </p>
                      <div className="space-y-2">
                        {explanation.structural_checks.map((check) => (
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
            )}
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

function SignalBar({
  feature,
  impact,
  maxImpact,
  variant,
}: {
  feature: string;
  impact: number;
  maxImpact: number;
  variant: "fraud" | "legit";
}) {
  const absImpact = Math.abs(impact);
  const absMax = Math.abs(maxImpact);
  const width = absMax > 0 ? Math.max(8, (absImpact / absMax) * 100) : 8;

  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 truncate text-xs font-medium">
        {feature}
      </span>
      <div className="relative flex-1 h-5">
        <div
          className={`absolute inset-y-0 left-0 rounded-r-sm ${
            variant === "fraud" ? "bg-red-500/20" : "bg-emerald-500/20"
          }`}
          style={{ width: `${width}%` }}
        />
        <span
          className={`absolute inset-y-0 left-2 flex items-center text-[11px] font-semibold ${
            variant === "fraud" ? "text-red-500" : "text-emerald-500"
          }`}
        >
          {absImpact.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
