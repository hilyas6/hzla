"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuditRow {
  id: string;
  action: string;
  user_email: string | null;
  target_email: string | null;
  ip: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export function AuditLogPanel() {
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/audit-log")
      .then((res) => res.json())
      .then(setRows)
      .catch(() => setError("Failed to load audit log."));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        {!rows ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-1 border border-[var(--neon-cyan)]/10 px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{row.action}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="break-all text-xs text-muted-foreground">
                  {row.user_email ?? "unknown"}
                  {row.target_email && ` → ${row.target_email}`}
                  {row.ip && ` · ${row.ip}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
