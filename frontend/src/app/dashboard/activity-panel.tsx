"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ActivityRow {
  action: string;
  ip: string | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  login_success: "Logged in",
  login_failure: "Failed login attempt",
  signup: "Account created",
  password_change: "Password changed",
  password_reset: "Password reset",
  two_factor_enabled: "Two-factor authentication enabled",
  two_factor_disabled: "Two-factor authentication disabled",
  account_delete: "Account deleted",
};

export function ActivityPanel() {
  const [rows, setRows] = useState<ActivityRow[] | null>(null);

  useEffect(() => {
    fetch("/api/account/activity")
      .then((res) => res.json())
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Security-relevant events on your account.</CardDescription>
      </CardHeader>
      <CardContent>
        {!rows ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
            {rows.map((row, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center justify-between gap-2 border border-[var(--neon-cyan)]/10 px-3 py-2 text-sm"
              >
                <span>{ACTION_LABELS[row.action] ?? row.action}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(row.created_at).toLocaleString()}
                  {row.ip && ` · ${row.ip}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
