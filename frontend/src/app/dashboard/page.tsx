import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { pool } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminPanel } from "./admin-panel";
import { AuditLogPanel } from "./audit-log-panel";
import { ActivityPanel } from "./activity-panel";
import { SessionsPanel } from "./sessions-panel";
import { LogoutButton } from "./logout-button";
import { SecuritySettings } from "./security-settings";
import { ProfileForm } from "./profile-form";
import { ChangePasswordForm } from "./change-password-form";
import { DeleteAccount } from "./delete-account";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role as Role;
  const canManageUsers = role === "admin" || role === "owner";

  const { rows } = await pool.query(
    `SELECT name, avatar_path, two_factor_enabled, notify_security_email,
            password_hash IS NOT NULL AS has_password
     FROM users WHERE id = $1`,
    [session!.user.id]
  );
  const name: string = rows[0]?.name ?? "";
  const avatarPath: string | null = rows[0]?.avatar_path ?? null;
  const twoFactorEnabled: boolean = rows[0]?.two_factor_enabled ?? false;
  const notifySecurityEmail: boolean = rows[0]?.notify_security_email ?? true;
  const hasPassword: boolean = rows[0]?.has_password ?? true;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-black uppercase tracking-wide">
            Dashboard
          </h1>
          {name && (
            <p className="mt-1 text-sm text-neon-cyan">Welcome back, {name}</p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-muted-foreground">
            <span className="break-all">{session?.user?.email}</span>
            <Badge variant={role === "user" ? "secondary" : "default"}>
              {role}
            </Badge>
          </div>
        </div>
        <LogoutButton />
      </div>

      {!name && (
        <div className="mb-5 border border-dashed border-neon-cyan/40 px-4 py-3 text-sm text-neon-cyan">
          Welcome! Add your name and a profile picture below to finish setting up your account.
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {canManageUsers ? (
          <div className="flex flex-col gap-5 sm:col-span-2">
            <AdminPanel currentUserId={session!.user.id} currentUserRole={role} />
            <AuditLogPanel />
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

        <ProfileForm initialName={name} initialAvatarPath={avatarPath} />
        {hasPassword && <ChangePasswordForm />}
        <SecuritySettings
          initialTwoFactorEnabled={twoFactorEnabled}
          initialNotifySecurityEmail={notifySecurityEmail}
        />
        <ActivityPanel />
        <SessionsPanel currentSessionId={session!.user.sessionId} />

        <div className="sm:col-span-2">
          <DeleteAccount hasPassword={hasPassword} />
        </div>
      </div>
    </div>
  );
}
