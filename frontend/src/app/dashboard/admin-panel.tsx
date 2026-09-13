"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UserRow {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export function AdminPanel({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadUsers() {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch(() => setError("Failed to load users."));
  }

  useEffect(loadUsers, []);

  async function toggleRole(user: UserRow) {
    const role = user.role === "admin" ? "user" : "admin";
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    loadUsers();
  }

  async function deleteUser(user: UserRow) {
    if (!confirm(`Delete ${user.email}? This can't be undone.`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to delete user.");
      return;
    }
    loadUsers();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        {!users ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 border border-[var(--neon-cyan)]/10 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span>{user.email}</span>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => toggleRole(user)}
                  >
                    Make {user.role === "admin" ? "User" : "Admin"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="xs"
                    disabled={user.id === currentUserId}
                    onClick={() => deleteUser(user)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
