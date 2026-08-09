import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Groundwork — AI-Verified Micro-Relief Platform",
  description: "Humanitarian disaster response micro-relief fulfillment & coordinator platform for India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F5F0E8] text-[#2D4A2D] flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
