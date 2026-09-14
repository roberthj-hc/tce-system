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
  title: "TCE",
  description: "TCE - SYSTEM",
  icons: {
    icon: "/favicon.ico",
  },
};

import { ThemeProvider } from "@/components/theme-provider"

import { Toaster } from "sonner";

import { AuthProvider  } from "@/context/AuthContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (

    <AuthProvider>
      <>
        <html lang="en" suppressHydrationWarning>
          <head />
          <body>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster richColors position="bottom-right"/>
            </ThemeProvider>
          </body>
        </html>
      </>
    </AuthProvider>

  )
}