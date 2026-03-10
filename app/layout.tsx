import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
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
  title: "Pomodoro — ADHD dostu odaklanma uygulaması",
  description: "Pomodoro ve Flowtime timer, görev yönetimi ve AI koç ile daha verimli çalış.",
  openGraph: {
    title: "Pomodoro — ADHD dostu odaklanma uygulaması",
    description: "Pomodoro ve Flowtime timer, görev yönetimi ve AI koç ile daha verimli çalış.",
    type: "website",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary",
    title: "Pomodoro — ADHD dostu odaklanma uygulaması",
    description: "Pomodoro ve Flowtime timer, görev yönetimi ve AI koç ile daha verimli çalış.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
