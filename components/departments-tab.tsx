"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
// Use plain anchor to ensure fragment navigation works reliably
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Department {
  id: number
  name: string
  code: string
}

export function DepartmentsTab() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await fetch("/api/departments")
        const data = await response.json()
        setDepartments(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("[v0] Error loading departments:", error)
        setDepartments([])
      } finally {
        setLoading(false)
      }
    }

    loadDepartments()
  }, [])

  const filtered = departments.filter(
    (d) => d.name.toLowerCase().includes(filter.toLowerCase()) || d.code.toLowerCase().includes(filter.toLowerCase()),
  )

  if (loading) {
    return <div className="text-center py-8 text-neutral-600">Loading departments...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-col sm:flex-row">
        <Input
          placeholder="Search departments..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1"
        />
        <Button asChild className="bg-primary hover:bg-primary-dark">
          <a className="!text-white no-underline" href="/admin/departments">Add Department</a>
        </Button>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-neutral-600">No departments found</div>
        ) : (
          filtered.map((dept) => (
            <Card key={dept.id} className="border-neutral-200">
              <CardHeader>
                <CardTitle className="text-lg">{dept.name}</CardTitle>
                <CardDescription>Code: {dept.code}</CardDescription>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
