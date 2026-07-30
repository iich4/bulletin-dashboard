import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PERKESO Bulletin Dashboard — Portal Pengetahuan & Komunikasi Dalaman",
  description:
    "Portal Pengetahuan & Komunikasi Dalaman PERKESO — capaian terpusat kepada pengumuman, Akta, ASIP, SOP, pekeliling, dan soalan lazim. Dibangunkan oleh IDEONIX Sdn Bhd.",
  keywords: [
    "PERKESO",
    "Bulletin Dashboard",
    "Portal Dalaman",
    "Akta",
    "SOP",
    "Pekeliling",
    "ASIP",
    "FAQ",
    "IDEONIX",
  ],
  authors: [{ name: "IDEONIX Sdn Bhd" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "PERKESO Bulletin Dashboard",
    description:
      "Portal Pengetahuan & Komunikasi Dalaman PERKESO oleh IDEONIX",
    siteName: "PERKESO Bulletin Dashboard",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
