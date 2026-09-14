"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { canManageRole, type Role } from "@/lib/roles";

interface UserRow {
  id: string;
  email: string;
  role: Role;
  created_at: string;
  is_suspended: boolean;
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
  const [search, setSearch] = useState("");

  function loadUsers() {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch(() => setError("Failed to load users."));
  }

  useEffect(loadUsers, []);

  async function patchUser(user: UserRow, body: Record<string, unknown>, failMessage: string) {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? failMessage);
      return;
    }
    loadUsers();
  }

  function toggleRole(user: UserRow) {
    const role = user.role === "admin" ? "user" : "admin";
    patchUser(user, { role }, "Failed to change role.");
  }

  function toggleSuspended(user: UserRow) {
    patchUser(user, { suspended: !user.is_suspended }, "Failed to update suspension.");
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

  const filtered = users?.filter((user) =>
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        <Input
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />
        {!users ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : filtered!.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matching users.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered!.map((user) => {
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
                    {user.is_suspended && <Badge variant="destructive">suspended</Badge>}
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="xs" onClick={() => toggleRole(user)}>
                        Make {user.role === "admin" ? "User" : "Admin"}
                      </Button>
                      <Button variant="outline" size="xs" onClick={() => toggleSuspended(user)}>
                        {user.is_suspended ? "Unsuspend" : "Suspend"}
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
