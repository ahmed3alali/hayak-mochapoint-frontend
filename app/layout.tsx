import type React from "react"
import { Almarai, IBM_Plex_Sans_Arabic } from "next/font/google"
import "./globals.css"
import BottomBar from "@/components/Bar/BottomBar"
import { CartProvider } from "@/app/components/CartContext"
import { LanguageProvider } from "@/lib/LanguageContext"
import AppLoader from "@/app/components/AppLoader"
import NavigationLoader from "@/app/components/NavigationLoader"

// Public site font - Almarai
const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  display: "swap",
  variable: "--font-almarai",
})

// Admin dashboard font - IBM Plex Sans Arabic (modern, technical)
const ibmPlex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ibm-plex",
})

export const metadata = {
  title: "Coffee Time - قائمة القهوة",
  description: "Coffee shop menu application with Arabic support",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${almarai.className} ${ibmPlex.variable}`}>
        <LanguageProvider>
          <CartProvider>
            <NavigationLoader />
            <AppLoader>
              {children}
            </AppLoader>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}