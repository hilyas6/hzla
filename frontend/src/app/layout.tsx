import type { Metadata } from "next";
import { Geist, Rajdhani, Orbitron, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    default: "HZLA",
    template: "%s | HZLA",
  },
  description:
    "A suite of AI-powered tools for job seekers — detect fake postings, track applications, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${rajdhani.variable} ${orbitron.variable} ${shareTechMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="cyber-grid cyber-grid-animated absolute inset-0" />
          <div className="glow-blob absolute -top-40 -left-32 h-96 w-96 rounded-full bg-[var(--neon-cyan)]/15" />
          <div
            className="glow-blob absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-[var(--neon-pink)]/10"
            style={{ animationDelay: "-5s" }}
          />
          <div
            className="glow-blob absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[var(--neon-yellow)]/5"
            style={{ animationDelay: "-8s" }}
          />
          <div className="scan-beam absolute" />
          <div className="scanline-overlay absolute inset-0" />
        </div>
        <Navbar />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
