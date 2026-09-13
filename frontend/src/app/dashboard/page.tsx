import type { Metadata } from "next";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display mb-2 text-2xl font-black uppercase tracking-wide">
        Dashboard
      </h1>
      <p className="text-muted-foreground">
        Logged in as {session?.user?.email} ({session?.user?.role})
      </p>
    </div>
  );
}
