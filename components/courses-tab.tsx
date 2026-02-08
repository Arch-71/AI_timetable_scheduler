"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
// Use plain anchor to ensure fragment navigation works reliably
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Course {
  id: number
  code: string
  name: string
  department_id: number
  credits: number
  total_credits: number
  lecture_credits: number
  tutorial_credits: number
  lab_credits: number
  semester: number
}

export function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await fetch("/api/courses")
        const data = await response.json()
        console.log("Courses API response:", data)
        console.log("Is array:", Array.isArray(data))
        // Ensure data is an array before setting it
        setCourses(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("[v0] Error loading courses:", error)
        setCourses([]) // Ensure courses is always an array
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  const filtered = Array.isArray(courses) ? courses.filter(
    (c) => c.code.toLowerCase().includes(filter.toLowerCase()) || c.name.toLowerCase().includes(filter.toLowerCase()),
  ) : []

  if (loading) {
    return <div className="text-center py-8 text-neutral-600">Loading courses...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-col sm:flex-row">
        <Input
          placeholder="Search courses..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1"
        />
        <Button asChild className="bg-primary hover:bg-primary-dark">
          <a className="!text-white no-underline" href="/admin/courses">Add Course</a>
        </Button>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-neutral-600">No courses found</div>
        ) : (
          filtered.map((course) => (
            <Card key={course.id} className="border-neutral-200">
              <CardHeader>
                <CardTitle className="text-lg">{course.code}</CardTitle>
                <CardDescription>{course.name}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-neutral-600">
                <p>
                  Credits: {course.total_credits || course.credits} (L:{course.lecture_credits}+T:{course.tutorial_credits}+P:{course.lab_credits})
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
