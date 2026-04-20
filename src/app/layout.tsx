import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/layout-shell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ViralForge | Autonomous Social Growth",
  description: "Next-gen AI co-pilot for social media growth and monetization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex bg-background text-foreground antialiased`}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
