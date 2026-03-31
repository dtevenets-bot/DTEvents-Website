import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DT Events - Premium Roblox Development",
  description: "Professional Roblox development solutions — gamepasses, plugins, assets, and custom commissions.",
  keywords: ["DT Events", "Roblox", "Gamepasses", "Plugins", "Development"],
  authors: [{ name: "DT Events" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "DT Events",
    description: "Premium Roblox Development Solutions",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DT Events",
    description: "Premium Roblox Development Solutions",
  },
  other: {
    generator: "Next.js",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-page text-ink`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
