import type React from "react"
import { Almarai } from "next/font/google"
import "./globals.css"
import BottomBar from "@/components/Bar/BottomBar"
import { CartProvider } from "@/app/components/CartContext"
import { LanguageProvider } from "@/lib/LanguageContext"
import AppLoader from "@/app/components/AppLoader"
import NavigationLoader from "@/app/components/NavigationLoader"

// Load the Almarai font
const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"], // you can adjust which weights you need
  display: "swap",
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
      <body className={almarai.className}>
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