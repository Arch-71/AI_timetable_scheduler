"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Student {
  id: number
  usn: string
  name: string
  email: string
  created_at?: string
}

export function StudentsTab() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/students")
        if (!response.ok) {
          throw new Error("Failed to fetch students")
        }
        const data = await response.json()
        setStudents(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading students")
        setStudents([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Students</h3>
        <Link href="/admin/students">
          <Button className="bg-primary text-white">Manage Students</Button>
        </Link>
      </div>

      <div>
        {loading ? (
          <p className="text-neutral-600">Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : students.length === 0 ? (
          <p className="text-neutral-600">No students yet. Click Manage Students to add.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-100 border">
                  <th className="px-4 py-2 text-left border">USN</th>
                  <th className="px-4 py-2 text-left border">Name</th>
                  <th className="px-4 py-2 text-left border">Email</th>
                  <th className="px-4 py-2 text-left border">Added</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 5).map((s) => (
                  <tr key={s.id} className="border hover:bg-neutral-50">
                    <td className="px-4 py-2 border font-medium">{s.usn}</td>
                    <td className="px-4 py-2 border">{s.name}</td>
                    <td className="px-4 py-2 border">{s.email}</td>
                    <td className="px-4 py-2 border text-xs text-neutral-600">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length > 5 && (
              <p className="text-xs text-neutral-600 mt-2">
                ... and {students.length - 5} more students
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
