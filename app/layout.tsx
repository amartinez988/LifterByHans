import "./globals.css";
import type { Metadata } from "next";
import { IBM_Plex_Sans, Playfair_Display } from "next/font/google";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700"]
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "LIFTER",
  description: "Vertical SaaS for elevator and escalator service teams."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans">
        <div className="min-h-screen relative overflow-hidden">
          <div className="absolute inset-0 lifter-grid opacity-40" />
          <div className="relative">{children}</div>
        </div>
      </body>
    </html>
  );
}
