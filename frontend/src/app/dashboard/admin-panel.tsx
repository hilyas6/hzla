"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { canManageRole, type Role } from "@/lib/roles";

interface UserRow {
  id: string;
  email: string;
  role: Role;
  created_at: string;
}

export function AdminPanel({
  currentUserId,
  currentUserRole,
}: {
  currentUserId: string;
  currentUserRole: Role;
}) {
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
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to change role.");
      return;
    }
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
            {users.map((user) => {
              const canManage =
                user.id !== currentUserId && canManageRole(currentUserRole, user.role);
              return (
                <div
                  key={user.id}
                  className="flex flex-col gap-2 border border-[var(--neon-cyan)]/10 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="break-all">{user.email}</span>
                    <Badge variant={user.role === "user" ? "secondary" : "default"}>
                      {user.role}
                    </Badge>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="xs" onClick={() => toggleRole(user)}>
                        Make {user.role === "admin" ? "User" : "Admin"}
                      </Button>
                      <Button variant="destructive" size="xs" onClick={() => deleteUser(user)}>
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
