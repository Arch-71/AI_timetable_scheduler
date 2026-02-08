"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white">
      <div className="container h-16 px-4 mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
            MCA
          </div>
          <span className="font-semibold text-neutral-900">Timetable Scheduler</span>
        </div>
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/login?role=admin">
            <Button size="sm" variant="outline">
              Admin Login
            </Button>
          </Link>
          <Link href="/login?role=faculty">
            <Button size="sm" variant="outline">
              Faculty Login
            </Button>
          </Link>
          <Link href="/login?role=student">
            <Button size="sm" variant="outline">
              Student Login
            </Button>
          </Link>
        </nav>
        <div className="md:hidden flex items-center gap-2">
          <Link href="/login?role=admin">
            <Button size="sm" variant="outline">
              Admin
            </Button>
          </Link>
          <Link href="/login?role=faculty">
            <Button size="sm" variant="outline">
              Faculty
            </Button>
          </Link>
          <Link href="/login?role=student">
            <Button size="sm" variant="outline">
              Student
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
