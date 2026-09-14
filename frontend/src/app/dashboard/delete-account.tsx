"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function DeleteAccount({ hasPassword }: { hasPassword: boolean }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("Delete your account? This can't be undone.")) return;

    setDeleting(true);
    setError(null);
    const res = await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hasPassword ? { password } : {}),
    });

    if (!res.ok) {
      const data = await res.json();
      setDeleting(false);
      setError(data.error ?? "Failed to delete account.");
      return;
    }

    await signOut({ callbackUrl: "/" });
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <a
          href="/api/account/export"
          className="mb-4 inline-block text-sm text-neon-cyan hover:underline"
        >
          Download my data
        </a>
        {open ? (
          <form onSubmit={handleDelete} className="flex flex-col gap-3">
            {hasPassword && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="delete-password">Confirm your password</Label>
                <Input
                  id="delete-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex items-center gap-3">
              <Button type="submit" variant="destructive" size="sm" disabled={deleting}>
                {deleting ? "Deleting..." : "Delete My Account"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
            Delete Account
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
