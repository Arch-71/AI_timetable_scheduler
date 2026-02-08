"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
// Use plain anchor to ensure fragment navigation works reliably
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Classroom {
  id: number
  name: string
  capacity: number
  location: string
}

export function ClassroomsTab() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  useEffect(() => {
    const loadClassrooms = async () => {
      try {
        const response = await fetch("/api/classrooms")
        const data = await response.json()
        setClassrooms(data)
      } catch (error) {
        console.error("[v0] Error loading classrooms:", error)
      } finally {
        setLoading(false)
      }
    }

    loadClassrooms()
  }, [])

  const filtered = classrooms.filter(
    (c) =>
      c.name.toLowerCase().includes(filter.toLowerCase()) || c.location.toLowerCase().includes(filter.toLowerCase()),
  )

  if (loading) {
    return <div className="text-center py-8 text-neutral-600">Loading classrooms...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-col sm:flex-row">
        <Input
          placeholder="Search classrooms..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1"
        />
        <Button asChild className="bg-primary hover:bg-primary-dark">
          <a className="!text-white no-underline" href="/admin/classrooms">Add Classroom</a>
        </Button>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-neutral-600">No classrooms found</div>
        ) : (
          filtered.map((classroom) => (
            <Card key={classroom.id} className="border-neutral-200">
              <CardHeader>
                <CardTitle className="text-lg">{classroom.name}</CardTitle>
                <CardDescription>{classroom.location}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-neutral-600">
                <p>Capacity: {classroom.capacity} students</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
