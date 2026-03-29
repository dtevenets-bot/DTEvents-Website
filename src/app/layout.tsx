import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DT Events - Premium Roblox Development",
  description: "Professional Roblox development solutions — gamepasses, plugins, assets, and custom commissions.",
  keywords: ["DT Events", "Roblox", "Gamepasses", "Plugins", "Development"],
  authors: [{ name: "DT Events" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
