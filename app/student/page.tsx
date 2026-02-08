"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { StudentProtectedRoute } from "@/components/student-protected-route"
import { Button } from "@/components/ui/button"
import { ForcePasswordChange } from "@/components/force-password-change"
import { TimetableViewer } from "@/components/TimetableViewer"

export default function StudentPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false)
  const [checkingPassword, setCheckingPassword] = useState(true)

  useEffect(() => {
    // Check if student needs to change password on first login
    const checkPasswordStatus = async () => {
      try {
        if (!user?.email) return
        const response = await fetch(`/api/students/check-password?email=${encodeURIComponent(user.email)}`)
        if (response.ok) {
          const data = await response.json()
          setNeedsPasswordChange(!data.password_changed)
        }
      } catch (err) {
        console.error("Error checking password status:", err)
      } finally {
        setCheckingPassword(false)
      }
    }

    if (user?.email) {
      checkPasswordStatus()
    }
  }, [user?.email])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handlePasswordChanged = () => {
    setNeedsPasswordChange(false)
  }

  if (checkingPassword) {
    return (
      <StudentProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-neutral-600">Loading...</p>
        </div>
      </StudentProtectedRoute>
    )
  }

  return (
    <StudentProtectedRoute>
      {needsPasswordChange && user?.email && (
        <ForcePasswordChange userEmail={user.email} onPasswordChanged={handlePasswordChanged} />
      )}
      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
        <header className="bg-white border-b border-neutral-200">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
                MCA
              </div>
              <h1 className="text-xl font-bold text-neutral-900">Student Timetable</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-600">{user?.name || user?.email}</span>
              <Button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <TimetableViewer currentUser={user} />
        </main>

        {/* Footer */}
        <footer className="bg-neutral-100 border-t border-neutral-200 mt-12 py-6">
          <div className="container mx-auto px-4 text-center text-sm text-neutral-600">
            <p>&copy; 2025 MCA Timetable Scheduler. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </StudentProtectedRoute>
  )
}
