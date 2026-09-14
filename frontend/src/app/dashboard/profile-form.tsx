"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CircleUserRound } from "lucide-react";
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
import { resizeImageToJpegDataUrl } from "@/lib/resize-image";

interface ProfileFormProps {
  initialName: string;
  initialAvatarPath: string | null;
}

export function ProfileForm({ initialName, initialAvatarPath }: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initialName);
  const [avatarPath, setAvatarPath] = useState(initialAvatarPath);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setSaving(false);
    setMessage(res.ok ? "Saved." : "Failed to save.");
    if (res.ok) router.refresh();
  }

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingAvatar(true);
    setAvatarError(null);
    try {
      const image = await resizeImageToJpegDataUrl(file);
      const res = await fetch("/api/account/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to upload image.");
      setAvatarPath(`${data.avatarPath}?t=${Date.now()}`);
      router.refresh();
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleAvatarRemove() {
    setUploadingAvatar(true);
    setAvatarError(null);
    const res = await fetch("/api/account/avatar", { method: "DELETE" });
    setUploadingAvatar(false);
    if (!res.ok) {
      setAvatarError("Failed to remove image.");
      return;
    }
    setAvatarPath(null);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your display name and profile picture.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
            {avatarPath ? (
              <Image
                src={`/avatars/${avatarPath}`}
                alt="Profile picture"
                width={64}
                height={64}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <CircleUserRound className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingAvatar ? "Uploading..." : "Upload photo"}
              </Button>
              {avatarPath && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploadingAvatar}
                  onClick={handleAvatarRemove}
                >
                  Remove
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
            />
            {avatarError && <p className="text-sm text-destructive">{avatarError}</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            {message && (
              <span className="text-sm text-muted-foreground">{message}</span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
