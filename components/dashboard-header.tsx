"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
            MCA
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900">Timetable Scheduler</h1>
            <p className="text-xs text-neutral-500">Admin Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-sm">
            <p className="text-neutral-900 font-medium">{user?.name}</p>
            <p className="text-neutral-500 text-xs">{user?.email}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
