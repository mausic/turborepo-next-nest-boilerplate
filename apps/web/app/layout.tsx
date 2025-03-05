import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { Analytics } from "@/components/analytics";
import { siteMetadata } from "@/config/site-metadata";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <link rel="apple-touch-icon" sizes="76x76" href="/static/favicons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/static/favicons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/static/favicons/favicon-16x16.png" />
        <link rel="shortcut icon" href="/static/favicons/favicon.ico" type="image/x-icon" />
        <link rel="manifest" href="/static/favicons/site.webmanifest" />
        <meta name="msapplication-config" content="/static/favicons/browserconfig.xml" />
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <ThemeProvider
            attribute={"class"}
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            {children}
            <Toaster />
            <TailwindIndicator />
          </ThemeProvider>
        </body>
        <Analytics />
      </html>
    </ClerkProvider>
  );
}
