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

interface SecuritySettingsProps {
  initialTwoFactorEnabled: boolean;
  initialNotifySecurityEmail: boolean;
}

export function SecuritySettings({
  initialTwoFactorEnabled,
  initialNotifySecurityEmail,
}: SecuritySettingsProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialTwoFactorEnabled);
  const [notifySecurityEmail, setNotifySecurityEmail] = useState(
    initialNotifySecurityEmail
  );
  const [savingTwoFactor, setSavingTwoFactor] = useState(false);
  const [savingNotify, setSavingNotify] = useState(false);

  async function toggleTwoFactor(checked: boolean) {
    setTwoFactorEnabled(checked);
    setSavingTwoFactor(true);
    await fetch("/api/account/two-factor", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: checked }),
    });
    setSavingTwoFactor(false);
  }

  async function toggleNotify(checked: boolean) {
    setNotifySecurityEmail(checked);
    setSavingNotify(true);
    await fetch("/api/account/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: checked }),
    });
    setSavingNotify(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>
          Control extra verification and security emails.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm">Two-Step Verification</span>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={toggleTwoFactor}
            disabled={savingTwoFactor}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm">Email me if my password changes</span>
          <Switch
            checked={notifySecurityEmail}
            onCheckedChange={toggleNotify}
            disabled={savingNotify}
          />
        </div>
      </CardContent>
    </Card>
  );
}
