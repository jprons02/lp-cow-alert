import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cow Alert — Laureate Park",
  description: "Report loose cattle in Laureate Park quickly and easily.",
  metadataBase: new URL("https://wholetthecowsout.com"),
  openGraph: {
    title: "Cow Alert — Laureate Park",
    description: "Report loose cattle in Laureate Park quickly and easily.",
    images: [
      {
        url: "/lpcows.jpg",
        width: 1200,
        height: 630,
        alt: "Cows grazing in Laureate Park",
      },
    ],
    siteName: "Cow Alert",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cow Alert — Laureate Park",
    description: "Report loose cattle in Laureate Park quickly and easily.",
    images: ["/lpcows.jpg"],
  },
  icons: {
    icon: "/cow-logo_1x1.png",
    apple: "/cow-logo_1x1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
