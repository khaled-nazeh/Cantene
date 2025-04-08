import type React from "react"
import "@/app/globals.css"
import { Cairo } from "next/font/google"
import ThemeClientWrapper from "@/app/theme-client-wrapper" // New wrapper component

// استخدام خط القاهرة للغة العربية
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.className} bg-gradient-to-br from-background to-muted/50 min-h-screen`}>
        <ThemeClientWrapper>{children}</ThemeClientWrapper>
      </body>
    </html>
  )
}
