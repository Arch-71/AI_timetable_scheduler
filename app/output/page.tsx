import { ProtectedRoute } from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { ExportTimetable } from "@/components/export-timetable"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function OutputPage() {
  return (
    <ProtectedRoute>
      <DashboardHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="outline">← Back to Dashboard</Button>
            </Link>
            <div>
              <h2 className="text-3xl font-bold text-neutral-900">Final Output</h2>
              <p className="text-neutral-600">Download and share your approved timetable</p>
            </div>
          </div>

          <div className="max-w-4xl">
            <ExportTimetable />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}
