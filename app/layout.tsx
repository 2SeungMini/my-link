import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  ),
  title: "MyLink",
  description: "A personal link portfolio powered by Firebase Firestore.",
  openGraph: {
    title: "MyLink",
    description: "A personal link portfolio powered by Firebase Firestore.",
    siteName: "MyLink",
    images: [{ url: "/og-image", width: 1200, height: 630, alt: "MyLink" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyLink",
    description: "A personal link portfolio powered by Firebase Firestore.",
    images: ["/og-image"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
