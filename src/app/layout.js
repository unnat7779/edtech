import "./globals.css"
import ErrorBoundary from "@/components/ErrorBoundary"

export const metadata = {
  title: "EdTech Platform",
  description: "JEE preparation platform with CBT tests and doubt sessions",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary min-h-screen">
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  )
}
