import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Ascension.AI - AI-Powered Workout Plans",
  description: "Generate personalized workout plans powered by AI. Customize exercises, track progress, and achieve your fitness goals with Ascension.AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Analytics />
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
