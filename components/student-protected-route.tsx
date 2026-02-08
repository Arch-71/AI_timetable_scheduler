"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface StudentProtectedRouteProps {
  children: React.ReactNode
}

export function StudentProtectedRoute({ children }: StudentProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "student") {
      // Redirect non-students to their respective dashboards
      if (user.role === "admin") {
        router.push("/dashboard")
      } else if (user.role === "faculty") {
        router.push("/faculty")
      } else {
        router.push("/login")
      }
      return
    }

    setIsAuthorized(true)
  }, [user, loading, router])

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xl mx-auto mb-4">
            MCA
          </div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
