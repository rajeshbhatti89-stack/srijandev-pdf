import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoHindi = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-hindi",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pdf.srijandev.in"),
  title: "Srijandev PDF - Free Online PDF Editor (English & Hindi)",
  description: "Edit, annotate, add Hindi & English text, sign, rotate, merge, and export PDF documents directly in your browser. 100% private, client-side, and free.",
  alternates: {
    canonical: "https://pdf.srijandev.in",
  },
  openGraph: {
    title: "Srijandev PDF - Free Online PDF Editor",
    description: "Edit, annotate, add Hindi & English text, sign, and export PDFs online.",
    url: "https://pdf.srijandev.in",
    siteName: "Srijandev PDF",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${notoHindi.variable} font-sans flex h-screen overflow-hidden bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100`}>
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
