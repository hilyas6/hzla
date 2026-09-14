"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SessionRow {
  id: string;
  user_agent: string | null;
  ip: string | null;
  remember: boolean;
  last_seen_at: string;
}

export function SessionsPanel({ currentSessionId }: { currentSessionId: string }) {
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadSessions() {
    fetch("/api/account/sessions")
      .then((res) => res.json())
      .then(setSessions)
      .catch(() => setError("Failed to load sessions."));
  }

  useEffect(loadSessions, []);

  async function revoke(id: string) {
    await fetch(`/api/account/sessions/${id}`, { method: "DELETE" });
    loadSessions();
  }

  async function revokeOthers() {
    if (!confirm("Log out every other device?")) return;
    await fetch("/api/account/sessions", { method: "DELETE" });
    loadSessions();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Devices & Sessions</CardTitle>
        <CardDescription>Where you're currently signed in.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        {!sessions ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-2 border border-[var(--neon-cyan)]/10 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="truncate">{s.user_agent ?? "Unknown device"}</span>
                  {s.ip && <span className="text-xs text-muted-foreground">{s.ip}</span>}
                  {s.id === currentSessionId && <Badge>This device</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(s.last_seen_at).toLocaleString()}
                  </span>
                  {s.id !== currentSessionId && (
                    <Button variant="destructive" size="xs" onClick={() => revoke(s.id)}>
                      Log out
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {sessions.length > 1 && (
              <Button variant="outline" size="xs" className="w-fit" onClick={revokeOthers}>
                Log out all other devices
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
