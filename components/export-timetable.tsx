"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ExportTimetableProps {
  versionId?: number
}

export function ExportTimetable({ versionId }: ExportTimetableProps) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const response = await fetch("/api/schedules")
        const data = await response.json()
        const approved = data.filter((s: any) => s.status === "approved")
        setSchedules(approved)
      } catch (error) {
        console.error("[v0] Error loading schedules:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSchedules()
  }, [])

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const response = await fetch("/api/export/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      })

      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `timetable-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert("Failed to export CSV")
    } finally {
      setExporting(false)
    }
  }

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      })

      if (!response.ok) throw new Error("Export failed")

      const { csv } = await response.json()

      // Create PDF content as HTML
      const html = `
        <html>
          <head>
            <title>Timetable</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #003d82; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #003d82; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Academic Timetable</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Faculty</th>
                  <th>Classroom</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${schedules
                  .map(
                    (s) => `
                  <tr>
                    <td>${s.course_code}</td>
                    <td>${s.course_name}</td>
                    <td>${s.faculty_name}</td>
                    <td>${s.classroom_name}</td>
                    <td>${s.start_time}</td>
                    <td>${s.end_time}</td>
                    <td>${s.schedule_date}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `

      const blob = new Blob([html], { type: "text/html" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `timetable-${new Date().toISOString().split("T")[0]}.html`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert("Failed to export PDF")
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card className="border-neutral-200 bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">Timetable Published Successfully</CardTitle>
          <CardDescription className="text-green-800">Your timetable is now ready for distribution</CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>Download your timetable in your preferred format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleExportCSV}
            disabled={exporting}
            className="w-full bg-primary hover:bg-primary-dark text-white justify-start"
          >
            📊 Export as CSV
          </Button>
          <Button
            onClick={handleExportPDF}
            disabled={exporting}
            className="w-full bg-accent hover:opacity-90 text-neutral-900 justify-start"
          >
            📄 Export as PDF
          </Button>
        </CardContent>
      </Card>

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle>Timetable Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-neutral-600 text-xs font-medium">Total Sessions</p>
              <p className="text-xl font-bold text-primary">{schedules.length}</p>
            </div>
            <div>
              <p className="text-neutral-600 text-xs font-medium">Unique Courses</p>
              <p className="text-xl font-bold text-primary">{new Set(schedules.map((s) => s.course_id)).size}</p>
            </div>
            <div>
              <p className="text-neutral-600 text-xs font-medium">Faculties</p>
              <p className="text-xl font-bold text-primary">{new Set(schedules.map((s) => s.faculty_id)).size}</p>
            </div>
            <div>
              <p className="text-neutral-600 text-xs font-medium">Classrooms</p>
              <p className="text-xl font-bold text-primary">{new Set(schedules.map((s) => s.classroom_id)).size}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle>Scheduled Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 px-3 font-semibold text-neutral-700">Course</th>
                  <th className="text-left py-2 px-3 font-semibold text-neutral-700">Faculty</th>
                  <th className="text-left py-2 px-3 font-semibold text-neutral-700">Room</th>
                  <th className="text-left py-2 px-3 font-semibold text-neutral-700">Time</th>
                </tr>
              </thead>
              <tbody>
                {schedules.slice(0, 10).map((schedule) => (
                  <tr key={schedule.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-2 px-3">
                      <p className="font-medium text-neutral-900">{schedule.course_code}</p>
                      <p className="text-xs text-neutral-500">{schedule.course_name}</p>
                    </td>
                    <td className="py-2 px-3 text-neutral-600">{schedule.faculty_name}</td>
                    <td className="py-2 px-3 text-neutral-600">{schedule.classroom_name}</td>
                    <td className="py-2 px-3 text-neutral-600">
                      {schedule.start_time} - {schedule.end_time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {schedules.length > 10 && (
              <p className="text-center text-sm text-neutral-500 mt-4">... and {schedules.length - 10} more sessions</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
