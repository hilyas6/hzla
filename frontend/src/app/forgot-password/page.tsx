import type { Metadata } from "next";
import { ForgotPasswordClient } from "./forgot-password-client";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your HZLA account password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-display mb-8 text-2xl font-black uppercase tracking-wide">
        Forgot Password
      </h1>
      <ForgotPasswordClient />
    </div>
  );
}
