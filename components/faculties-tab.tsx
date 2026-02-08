"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
// Use plain anchor to ensure fragment navigation works reliably
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Faculty {
  id: number
  name: string
  email: string
  specialization: string
  department_id: number
}

export function FacultiesTab() {
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  useEffect(() => {
    const loadFaculties = async () => {
      try {
        const response = await fetch("/api/faculties")
        const data = await response.json()
        setFaculties(data)
      } catch (error) {
        console.error("[v0] Error loading faculties:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFaculties()
  }, [])

  const filtered = faculties.filter(
    (f) => f.name.toLowerCase().includes(filter.toLowerCase()) || f.email.toLowerCase().includes(filter.toLowerCase()),
  )

  if (loading) {
    return <div className="text-center py-8 text-neutral-600">Loading faculties...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-col sm:flex-row">
        <Input
          placeholder="Search faculties..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1"
        />
        <Button asChild className="bg-primary hover:bg-primary-dark">
          <a className="!text-white no-underline" href="/admin/faculties">Add Faculty</a>
        </Button>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-neutral-600">No faculties found</div>
        ) : (
          filtered.map((faculty) => (
            <Card key={faculty.id} className="border-neutral-200">
              <CardHeader>
                <CardTitle className="text-lg">{faculty.name}</CardTitle>
                <CardDescription>{faculty.email}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-neutral-600">
                <p>{faculty.specialization}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
