import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminPanel } from "./admin-panel";
import { LogoutButton } from "./logout-button";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-wide">
            Dashboard
          </h1>
          <div className="mt-1.5 flex items-center gap-2 text-muted-foreground">
            <span>{session?.user?.email}</span>
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {session?.user?.role}
            </Badge>
          </div>
        </div>
        <LogoutButton />
      </div>

      {isAdmin ? (
        <AdminPanel currentUserId={session!.user.id} />
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
    </div>
  );
}
