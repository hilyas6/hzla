import type { Metadata } from "next";
import { LoginClient } from "./login-client";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your HZLA account.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-display mb-8 text-2xl font-black uppercase tracking-wide">
        Log In
      </h1>
      <LoginClient />
    </div>
  );
}
