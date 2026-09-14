import type { Metadata } from "next";
import Image from "next/image";
import { Clipboard, Download, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "HZLAPaste",
  description:
    "A native macOS clipboard manager: history bar, text expansion, link previews, and encrypted-at-rest storage.",
};

const RELEASE = "https://github.com/hilyas6/HZLAPASTE/releases/latest";
const DMG_URL = `${RELEASE}/download/HZLAPaste.dmg`;
const REPO = "https://github.com/hilyas6/HZLAPASTE";

const features = [
  {
    title: "Clipboard history bar (⌘⇧V)",
    image: "/tools/hzlapaste/history-bar.png",
    width: 3024,
    height: 486,
    body: (
      <>
        <p>
          A floating, edge-to-edge glass bar docked above the Dock — press{" "}
          <Kbd>⌘⇧V</Kbd> anywhere to bring it up, search or arrow through
          recent items, hit <Kbd>Enter</Kbd> to paste into whatever app you
          were just in, <Kbd>⌘Enter</Kbd> to copy without pasting, or{" "}
          <Kbd>Esc</Kbd> to dismiss.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            Captures text, images (including animated GIFs), files, and links
            copied anywhere.
          </li>
          <li>Copied links auto-fetch their page title and preview image.</li>
          <li>Pin items to keep them out of retention/archiving.</li>
          <li>
            Per-item preview panel with paste, copy, pin, and delete actions.
          </li>
          <li>
            Skips content from apps that mark it concealed/transient (e.g.
            password managers), and lets you manually exclude any app from
            being captured.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Preview panel",
    image: "/tools/hzlapaste/preview-panel.png",
    width: 1120,
    height: 1040,
    body: (
      <p>
        Select any item to see a full preview with paste, copy, pin, and
        delete actions right there — no need to paste blind to check what you
        copied.
      </p>
    ),
  },
  {
    title: "Menu bar quick access",
    image: "/tools/hzlapaste/menubar-dropdown.png",
    width: 822,
    height: 566,
    body: (
      <p>
        Lives in the menu bar (no Dock icon required) with pinned and recent
        items one click away, plus shortcuts to Snippets, Preferences, and
        clearing history.
      </p>
    ),
  },
  {
    title: "Snippets (text expansion)",
    image: "/tools/hzlapaste/snippets.png",
    width: 960,
    height: 1040,
    body: (
      <p>
        Define a keyword → body pair once, then type the keyword anywhere on
        the Mac followed by a space/tab/return and it expands in place — the
        same trick as Raycast or TextExpander, gated behind macOS
        Accessibility permission.
      </p>
    ),
  },
  {
    title: "Archive & retention",
    image: "/tools/hzlapaste/archive.png",
    width: 960,
    height: 1040,
    body: (
      <p>
        Unpinned items automatically move to an Archive tab after a
        configurable number of days, then are permanently deleted after a
        second configurable cutoff — copied content can be sensitive and
        shouldn&apos;t linger forever. Pinned items are exempt. Anything
        archived can be restored or deleted early.
      </p>
    ),
  },
  {
    title: "Preferences",
    image: "/tools/hzlapaste/preferences.png",
    width: 960,
    height: 1040,
    body: (
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        <li>Launch at login, show/hide the Dock icon</li>
        <li>History size limit</li>
        <li>Toggle link-preview fetching and snippet expansion</li>
        <li>Archive-after / delete-after retention windows</li>
        <li>Per-app exclusion list</li>
      </ul>
    ),
  },
];

const shortcuts = [
  ["Open history bar", "⌘⇧V"],
  ["Paste selected item", "Enter / click"],
  ["Copy without pasting", "⌘Enter / ⌘-click"],
  ["Preview selected item", "Space"],
  ["Dismiss bar", "Esc"],
  ["Open Preferences", "⌘, (from the bar or menu bar)"],
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
      {children}
    </kbd>
  );
}

export default function HzlaPaste() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[color-mix(in_srgb,var(--neon-cyan)_14%,transparent)] text-neon-cyan shadow-neon-cyan [clip-path:var(--clip-poly-sm)]">
            <Clipboard className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl font-black uppercase tracking-wide sm:text-3xl">
            HZLAPaste
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Live</Badge>
          <Badge variant="secondary">macOS only</Badge>
        </div>
      </div>
      <p className="text-muted-foreground mb-6 max-w-2xl">
        A native macOS clipboard manager: a Raycast/Paste-style history bar,
        keyword text expansion, link previews, and encrypted-at-rest storage —
        built with Swift and SwiftUI.
      </p>

      <div className="mb-10 flex flex-wrap gap-3">
        <Button className="w-full justify-center sm:w-64" render={<a href={DMG_URL} />}>
          <Download className="h-4 w-4" />
          Download .dmg
        </Button>
        <Button
          variant="outline"
          className="w-full justify-center sm:w-64"
          render={<a href={REPO} target="_blank" rel="noreferrer" />}
        >
          <ExternalLink className="h-4 w-4" />
          View source on GitHub
        </Button>
      </div>

      <div className="mb-10 flex items-center gap-3 rounded border border-border bg-muted px-4 py-3">
        <Image
          src="/tools/hzlapaste/menubar.png"
          alt="HZLAPaste menu bar icon"
          width={68}
          height={48}
          className="h-8 w-auto"
        />
        <span className="text-sm text-muted-foreground">
          Lives quietly in the menu bar — no Dock icon required.
        </span>
      </div>

      <div className="space-y-12">
        {features.map((f) => (
          <section key={f.title}>
            <h2 className="mb-3 font-display text-lg font-bold uppercase tracking-wide">
              {f.title}
            </h2>
            <Image
              src={f.image}
              alt={f.title}
              width={f.width}
              height={f.height}
              className="mb-4 max-h-[520px] w-auto rounded border border-border"
            />
            <div className="text-sm leading-relaxed">{f.body}</div>
          </section>
        ))}
      </div>

      <Separator className="mb-12" />

      <section className="mb-12">
        <h2 className="mb-3 font-display text-lg font-bold uppercase tracking-wide">
          Requirements
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>macOS 14 (Sonoma) or later</li>
          <li>
            Xcode Command Line Tools (only if building from source):{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              xcode-select --install
            </code>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 font-display text-lg font-bold uppercase tracking-wide">
          Installation
        </h2>
        <p className="mb-2 text-sm">
          <strong>Option A — DMG (easiest).</strong> Download{" "}
          <a href={DMG_URL} className="text-neon-cyan underline">
            HZLAPaste.dmg
          </a>
          , double-click to mount, then drag HZLAPaste into Applications.
        </p>
        <p className="mb-4 text-sm">
          <strong>Option B — build from source:</strong>
        </p>
        <pre className="mb-4 overflow-x-auto rounded border border-border bg-muted p-4 font-mono text-xs">
{`git clone ${REPO}.git
cd HZLAPASTE
./build.sh`}
        </pre>
        <p className="mb-2 text-sm text-muted-foreground">
          This builds a release binary with Swift Package Manager and
          packages it as <code>HZLAPaste.app</code> in the project root. To
          rebuild the <code>.dmg</code> installer instead, run{" "}
          <code>./make-dmg.sh</code>.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 font-display text-lg font-bold uppercase tracking-wide">
          Opening an unsigned app
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          HZLAPaste is signed with a local development certificate, not an
          Apple Developer ID, so it isn&apos;t notarized. macOS Gatekeeper
          will block it the first time. To open it anyway:
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Right-click (or Control-click) HZLAPaste.app in Applications and
            choose <strong>Open</strong> — then <strong>Open</strong> again in
            the confirmation dialog. You only need to do this once.
          </li>
          <li>
            If that option doesn&apos;t appear, go to{" "}
            <strong>System Settings → Privacy &amp; Security</strong>, scroll
            to <strong>Security</strong>, and click{" "}
            <strong>Open Anyway</strong>.
          </li>
          <li>
            If macOS says the app &quot;is damaged and can&apos;t be
            opened,&quot; clear the quarantine flag from Terminal:
            <pre className="mt-2 overflow-x-auto rounded border border-border bg-muted p-3 font-mono text-xs">
xattr -cr /Applications/HZLAPaste.app
            </pre>
          </li>
        </ol>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 font-display text-lg font-bold uppercase tracking-wide">
          Permissions
        </h2>
        <p className="text-sm text-muted-foreground">
          On first use, macOS will prompt for <strong>Accessibility</strong> —
          required for auto-paste and snippet expansion. Grant it in{" "}
          <strong>System Settings → Privacy &amp; Security → Accessibility</strong>.
          Nothing else is needed — clipboard monitoring itself uses no private
          APIs and needs no permission.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 font-display text-lg font-bold uppercase tracking-wide">
          Keyboard shortcuts
        </h2>
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <tbody>
              {shortcuts.map(([action, keys]) => (
                <tr key={action} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5">{action}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">
                    {keys}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section className="mb-4">
        <h2 className="mb-3 font-display text-lg font-bold uppercase tracking-wide">
          Encrypted at rest &amp; license
        </h2>
        <p className="text-sm text-muted-foreground">
          Clipboard history and snippets are stored on disk encrypted with
          AES-GCM; the key lives in the macOS Keychain, never embedded in the
          app or written next to the data. Released under the MIT license —
          see{" "}
          <a href={`${REPO}/blob/main/LICENSE`} className="text-neon-cyan underline">
            LICENSE
          </a>{" "}
          for details. Every version is published on the{" "}
          <a href={`${REPO}/releases`} className="text-neon-cyan underline">
            Releases page
          </a>
          .
        </p>
      </section>
    </div>
  );
}
