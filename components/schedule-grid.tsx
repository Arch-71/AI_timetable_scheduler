"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Schedule {
  id: number
  course_code: string
  course_name: string
  faculty_name: string
  classroom_name: string
  start_time: string
  end_time: string
  schedule_date: string
  status: string
}

export function ScheduleGrid() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const response = await fetch("/api/schedules")
        const data = await response.json()
        setSchedules(data)
      } catch (error) {
        console.error("[v0] Error loading schedules:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSchedules()
  }, [])

  const filtered = filter === "all" ? schedules : schedules.filter((s) => s.status === filter)

  if (loading) {
    return <div className="text-center py-8 text-neutral-600">Loading schedules...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {["all", "draft", "pending", "approved"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status ? "bg-primary text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({filtered.length})
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-neutral-600">No schedules found</div>
        ) : (
          filtered.map((schedule) => (
            <Card key={schedule.id} className="border-neutral-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{schedule.course_code}</CardTitle>
                    <CardDescription>{schedule.course_name}</CardDescription>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      schedule.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : schedule.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {schedule.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-500 text-xs font-medium">Faculty</p>
                    <p className="text-neutral-900 font-medium">{schedule.faculty_name}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs font-medium">Classroom</p>
                    <p className="text-neutral-900 font-medium">{schedule.classroom_name}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs font-medium">Time</p>
                    <p className="text-neutral-900 font-medium">
                      {schedule.start_time} - {schedule.end_time}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs font-medium">Date</p>
                    <p className="text-neutral-900 font-medium">{schedule.schedule_date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
