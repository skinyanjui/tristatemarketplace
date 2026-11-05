import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { TabBar } from "@/components/TabBar";
import { Toaster } from "@/components/Toaster";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tristatemarketplace.vercel.app"),
  title: { default: "Tristate Market", template: "%s | Tristate Market" },
  description: "Local classifieds for the Evansville tristate: cars, real estate, land, livestock, garage sales, events and more.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div className="nav-wrap" style={{ height: 112 }} />}>
          <Nav />
        </Suspense>
        {children}
        <Footer />
        <Toaster />
        <Suspense fallback={null}>
          <TabBar />
        </Suspense>
      </body>
    </html>
  );
}
