import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DT Events - Premium Events & Products",
  description: "DT Events delivers quality product manufacturing, custom commissions, and curated bi-weekly events. Experience excellence in every detail.",
  keywords: ["DT Events", "Events", "Products", "Commissions", "Manufacturing"],
  authors: [{ name: "DT Events Team" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "DT Events",
    description: "Premium Products",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DT Events",
    description: "Premium Events & Products",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
