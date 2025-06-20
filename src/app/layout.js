import { Inter } from "next/font/google"
import "./globals.css"
import ConsistentNavigation from "@/components/navigation/ConsistentNavigation"
import FloatingFeedbackButton from "@/components/feedback/FloatingFeedbackButton"
import TokenRefreshHandler from "@/components/auth/TokenRefreshHandler"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "JEEElevate - Let's Ace JEE Together",
  description: "Premium JEE preparation platform with AI-powered learning",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-900 min-h-screen`}>
        {/* <ConsistentNavigation /> */}
        <TokenRefreshHandler />
        {children}
        <FloatingFeedbackButton />
      </body>
    </html>
  )
}
