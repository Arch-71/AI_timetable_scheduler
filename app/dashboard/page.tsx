"use client"

import { AdminProtectedRoute } from "@/components/admin-protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { DataInputTabs } from "@/components/data-input-tabs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    const token = localStorage.getItem("auth_token")
    try {
      const res = await fetch('/api/admin/requests', {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      const data = await res.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch requests:', error)
      setRequests([])
    }
  }

  return (
    <AdminProtectedRoute>
      <DashboardHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">Manage Academic Data</h2>
              <p className="text-neutral-600">Configure departments, courses, faculties, and classrooms</p>
            </div>
            
            <div className="flex gap-2">
              <Link href="/faculty-assignments">
                <Button  variant="outline" className="border-neutral-300 text-neutral-700 hover:bg-neutral-50">
                  Go to Faculty Assignments
                </Button>
              </Link>

              <Link href="/dashboard/timetable">
                <Button variant="outline" className="border-neutral-300 text-neutral-700 hover:bg-neutral-50">View Timetable</Button>
              </Link>
              <Link href="/admin/requests">
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                  Faculty Requests ({requests.filter(r => r.status === 'pending').length})
                </Button>
              </Link>
              <Link href="/generation">
                <Button className="bg-primary hover:bg-primary-dark text-white">Generate Timetable</Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <DataInputTabs />
          </div>
        </div>
      </main>
    </AdminProtectedRoute>
  )
}
