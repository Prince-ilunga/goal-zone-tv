import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://goalzonetv.cd";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GOAL ZONE TV — Actualité sportive en RDC et dans le monde",
    template: "%s — GOAL ZONE TV",
  },
  description:
    "GOAL ZONE TV : l'actualité sportive de Lubumbashi, de la RDC et du monde. Football, basketball, boxe, athlétisme. Suivez LINAFOOT, Léopards, CAF, Premier League et bien plus.",
  keywords: [
    "GOAL ZONE TV",
    "Moïse Kalala",
    "Lubumbashi",
    "RDC",
    "football",
    "LINAFOOT",
    "Léopards",
    "CAF",
    "Premier League",
    "sport",
    "Haut-Katanga",
  ],
  authors: [{ name: "Moïse Kalala", url: siteUrl }],
  creator: "Moïse Kalala",
  publisher: "GOAL ZONE TV",
  applicationName: "GOAL ZONE TV",
  alternates: {
    canonical: "/",
    languages: { "fr-CD": "/" },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_CD",
    url: siteUrl,
    siteName: "GOAL ZONE TV",
    title: "GOAL ZONE TV — Actualité sportive en RDC et dans le monde",
    description:
      "L'actualité sportive de Lubumbashi, de la RDC et du monde. Football, basketball, boxe, athlétisme.",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "GOAL ZONE TV",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GOAL ZONE TV — Actualité sportive",
    description:
      "L'actualité sportive de Lubumbashi, de la RDC et du monde.",
    images: ["/logo.jpg"],
  },
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
    shortcut: "/logo.jpg",
  },
  category: "sports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
