"use client"

import { useRouter } from "next/navigation"
import { useAuthCleanup } from "@/hooks/useAuthCleanup"
import { Button } from "@/components/ui/Button"

export default function LogoutButton({ className = "", children = "Logout" }) {
  const router = useRouter()
  const { handleLogout } = useAuthCleanup()

  const onLogout = async () => {
    const confirmed = confirm("Are you sure you want to logout? Any unsaved test progress will be lost.")

    if (confirmed) {
      const success = await handleLogout()
      if (success) {
        router.push("/login")
      } else {
        alert("Logout failed. Please try again.")
      }
    }
  }

  return (
    <Button onClick={onLogout} variant="outline" className={className}>
      {children}
    </Button>
  )
}
