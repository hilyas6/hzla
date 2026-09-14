import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { pool } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminPanel } from "./admin-panel";
import { LogoutButton } from "./logout-button";
import { TwoFactorToggle } from "./two-factor-toggle";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const { rows } = await pool.query(
    "SELECT two_factor_enabled FROM users WHERE id = $1",
    [session!.user.id]
  );
  const twoFactorEnabled: boolean = rows[0]?.two_factor_enabled ?? false;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-black uppercase tracking-wide">
            Dashboard
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-muted-foreground">
            <span className="break-all">{session?.user?.email}</span>
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {session?.user?.role}
            </Badge>
          </div>
        </div>
        <LogoutButton />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {isAdmin ? (
          <div className="sm:col-span-2">
            <AdminPanel currentUserId={session!.user.id} />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Tools</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Link
                href="/tools/fake-job-detector"
                className="flex items-center gap-2 text-sm text-neon-cyan hover:underline"
              >
                <ShieldCheck className="h-4 w-4" />
                Fake Job Detector
              </Link>
              <p className="text-sm text-muted-foreground">
                More tools unlock here as they launch.
              </p>
            </CardContent>
          </Card>
        )}

        <TwoFactorToggle initialEnabled={twoFactorEnabled} />
      </div>
    </div>
  );
}
