import React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Botanical AL | Main Dashboard",
  description: "High-fidelity sensory edge for the Botanical AL ecosystem • floral.monster",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#050505] text-[#fdfcf0] antialiased selection:bg-emerald-900/50">
        {children}
      </body>
    </html>
  );
}