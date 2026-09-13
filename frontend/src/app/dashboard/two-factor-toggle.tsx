"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function TwoFactorToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);

  async function toggle(checked: boolean) {
    setEnabled(checked);
    setSaving(true);
    await fetch("/api/account/two-factor", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: checked }),
    });
    setSaving(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>
          Email a one-time code every time you log in, for extra protection.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-sm">Two-Step Verification</span>
        <Switch
          checked={enabled}
          onCheckedChange={toggle}
          disabled={saving}
        />
      </CardContent>
    </Card>
  );
}
