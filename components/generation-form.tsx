"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface GenerationOption {
  id: string
  name: string
  description: string
  icon: string
}

export function GenerationForm() {
  const [versionName, setVersionName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedOption, setSelectedOption] = useState("auto")
  const [scheduleStats, setScheduleStats] = useState<{
    classrooms: number
    courses: number
    faculties: number
    labs: number
    regular: number
    total?: number
    draft?: number
  }>({
    classrooms: 0,
    courses: 0,
    faculties: 0,
    labs: 0,
    regular: 0,
    total: 0,
    draft: 0
  })
  const [generating, setGenerating] = useState(false)

  const router = useRouter()
  const { user } = useAuth()

// Fetch stats from DB
// Fetch stats from DB
useEffect(() => {
  const loadStats = async () => {
    try {
      // Fetch all required data in parallel
      const [classroomsRes, coursesRes, facultiesRes] = await Promise.all([
        fetch("/api/classrooms"),
        fetch("/api/courses"),
        fetch("/api/faculties")
      ]);

      // Check all responses
      if (!classroomsRes.ok || !coursesRes.ok || !facultiesRes.ok) {
        throw new Error(`HTTP error! Status: ${classroomsRes.status}, ${coursesRes.status}, ${facultiesRes.status}`);
      }

      // Parse JSON responses
      const [classroomsData, coursesData, facultiesData] = await Promise.all([
        classroomsRes.json(),
        coursesRes.json(),
        facultiesRes.json()
      ]);

      // Process data with null checks
      const classrooms = Array.isArray(classroomsData) ? classroomsData : [];
      const courses = Array.isArray(coursesData) ? coursesData : [];
      const faculties = Array.isArray(facultiesData) ? facultiesData : [];

      // Update state with all stats
      setScheduleStats(prev => ({
        ...prev,
        classrooms: classrooms.length,
        labs: classrooms.filter((c: any) => c?.room_type === 'lab').length,
        regular: classrooms.filter((c: any) => c?.room_type === 'classroom').length,
        courses: courses.length,
        faculties: faculties.length
      }));

    } catch (err) {
      console.error("Error loading stats:", err);
      // Set default values
      setScheduleStats(prev => ({
        ...prev,
        classrooms: 0,
        labs: 0,
        regular: 0,
        courses: 0,
        faculties: 0
      }));
    }
  };

  loadStats();
}, []);

  const options: GenerationOption[] = [
    {
      
    
      id: "auto",
      name: "Automatic Generation",
      description: "Let the system automatically generate the timetable based on constraints and availability.",
      icon: "🤖"
    },
  ]

  // Dummy generate handler with simulated delay
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!versionName.trim()) return

    setGenerating(true)

    // Simulate generating for 2 seconds
    setTimeout(() => {
      setGenerating(false)
      router.push("/dashboard/timetable")
    }, 20000)
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-neutral-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Total Classrooms/Labs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{scheduleStats.classrooms}</div>
            
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{scheduleStats.courses}</div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Faculties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{scheduleStats.faculties}</div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Ready</div>
          </CardContent>
        </Card>
      </div>

      {/* Generation Method Selection */}
     {/* <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle>Generation Method</CardTitle>
          <CardDescription>Choose how to create your timetable version</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedOption === option.id
                    ? "border-primary bg-blue-50"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div className="text-2xl mb-2">{option.icon}</div>
                <h3 className="font-semibold text-neutral-900">{option.name}</h3>
                <p className="text-sm text-neutral-600 mt-1">{option.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card> */}

      {/* Version Details Form */}
      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle>Version Details</CardTitle>
          <CardDescription>Name and describe your timetable version</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Timetable Name</label>
              <Input
                placeholder="e.g., Summer 2024 - MCA Batch A"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Description (Optional)</label>
              <textarea
                placeholder="Add notes about this timetable version..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white flex-1"
                disabled={generating}
              >
                {generating ? "Generating..." : "Generate Timetable"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
