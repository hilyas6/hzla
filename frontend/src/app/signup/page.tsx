import type { Metadata } from "next";
import { SignupClient } from "./signup-client";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create an HZLA account.",
};

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-display mb-8 text-2xl font-black uppercase tracking-wide">
        Sign Up
      </h1>
      <SignupClient />
    </div>
  );
}
