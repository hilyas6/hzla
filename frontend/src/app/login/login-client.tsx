"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

type Step = "credentials" | "otp";

export function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("credentials");
  const [otpHint, setOtpHint] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function finishLogin() {
    const result = await signIn("credentials", {
      email,
      password,
      otp,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid or expired code.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function requestLogin() {
    const res = await fetch("/api/auth/login-init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
    return data.step as "verify-email" | "otp" | "none";
  }

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const nextStep = await requestLogin();
      if (nextStep === "none") {
        setOtp("");
        await finishLogin();
      } else {
        setOtpHint(
          nextStep === "verify-email"
            ? "Verify your email to finish logging in — we sent a code to"
            : "Enter the 6-digit code we sent to"
        );
        setStep("otp");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await finishLogin();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    try {
      await requestLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (step === "otp") {
    return (
      <Card>
        <CardContent>
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {otpHint} {email}.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="otp">Code</Label>
              <Input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Log In"}
            </Button>
            <button
              type="button"
              onClick={handleResend}
              className="text-sm text-neon-cyan hover:underline"
            >
              Resend code
            </button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                className="pr-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Checking..." : "Log In"}
          </Button>
          <p className="text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/signup" className="text-neon-cyan hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
