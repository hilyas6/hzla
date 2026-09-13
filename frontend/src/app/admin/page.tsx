import type { Metadata } from "next";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display mb-2 text-2xl font-black uppercase tracking-wide">
        Admin
      </h1>
      <p className="text-muted-foreground">
        Signed in as admin: {session?.user?.email}
      </p>
    </div>
  );
}
