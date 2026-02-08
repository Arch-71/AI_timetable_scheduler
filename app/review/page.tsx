"use client"

import { useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { ScheduleGrid } from "@/components/schedule-grid"
import { ReviewActions } from "@/components/review-actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ReviewPage() {
  const searchParams = useSearchParams()
  const versionId = searchParams.get("version")

  return (
    <ProtectedRoute>
      <DashboardHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/generation">
              <Button variant="outline">← Back</Button>
            </Link>
            <div>
              <h2 className="text-3xl font-bold text-neutral-900">Review Timetable</h2>
              <p className="text-neutral-600">Review and approve the generated timetable</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">Schedule Overview</h3>
                <ScheduleGrid />
              </div>
            </div>

            <div>
              <ReviewActions versionId={versionId ? Number.parseInt(versionId) : undefined} status="draft" />
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}
