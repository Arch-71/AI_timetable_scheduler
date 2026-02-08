import { ProtectedRoute } from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { GenerationForm } from "@/components/generation-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GenerationPage() {
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
              <h2 className="text-3xl font-bold text-neutral-900">Generate Timetable</h2>
              <p className="text-neutral-600">Create a new timetable version with optimization</p>
            </div>
          </div>

          <div className="max-w-4xl">
            <GenerationForm />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}
