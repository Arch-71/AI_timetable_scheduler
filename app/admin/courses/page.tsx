"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AdminProtectedRoute } from "@/components/admin-protected-route"

export default function CoursesAdmin() {
  const [departments, setDepartments] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [form, setForm] = useState({
    code: "",
    name: "",
    department_id: "",
    course_type: "",
    hours_per_week: "",
    lecture_credits: "",
    tutorial_credits: "",
    lab_credits: "",
    total_credits: ""
  })

  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => { fetchDepartments(); fetchCourses() }, [])

  async function fetchDepartments() {
    const res = await fetch('/api/departments')
    const data = await res.json()
    setDepartments(data || [])
  }

  async function fetchCourses() {
    const res = await fetch('/api/courses')
    const data = await res.json()
    setCourses(data || [])
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    if (editingId) {
      await fetch(`/api/courses/${editingId}`, { method: 'PATCH', body: JSON.stringify(form), headers: { 'Content-Type': 'application/json' } })
    } else {
      await fetch('/api/courses', { method: 'POST', body: JSON.stringify(form), headers: { 'Content-Type': 'application/json' } })
    }
    setForm({
      code: "",
      name: "",
      department_id: "",
      course_type: "",
      hours_per_week: "",
      lecture_credits: "",
      tutorial_credits: "",
      lab_credits: "",
      total_credits: ""
    })
    setEditingId(null)
    fetchCourses()
  }

  function startEdit(course: any) {
    setEditingId(course.id)
    setForm({
      code: course.code,
      name: course.name,
      department_id: course.department_id,
      course_type: course.course_type || "",
      hours_per_week: course.hours_per_week,
      lecture_credits: course.lecture_credits,
      tutorial_credits: course.tutorial_credits,
      lab_credits: course.lab_credits,
      total_credits: course.total_credits
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({
      code: "",
      name: "",
      department_id: "",
      course_type: "",
      hours_per_week: "",
      lecture_credits: "",
      tutorial_credits: "",
      lab_credits: "",
      total_credits: ""
    })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Link href="/dashboard" className="px-3 py-2 bg-neutral-100 rounded">← Back to Dashboard</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">Courses</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-4">{editingId ? 'Edit Course' : 'Add Course Form'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Course Code</label>
            <input placeholder="Enter course code (e.g., CS101, 1st Year)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Course Name</label>
            <input placeholder="Enter course name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} className="border p-2 rounded w-full">
              <option value="">Select department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Course Type</label>
            <select value={form.course_type} onChange={(e) => setForm({ ...form, course_type: e.target.value })} className="border p-2 rounded w-full">
              <option value="">Select course type</option>
              <option value="BSC">BSC</option>
              <option value="IPCC">IPCC</option>
              <option value="PCC">PCC</option>
              <option value="PEC">PEC</option>
              <option value="PCL">PCL</option>
              <option value="HS">HS</option>
              <option value="NCMC">NCMC</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Credits (L, T, P)</label>
              <div className="flex space-x-2">
                <input
                  placeholder="L"
                  value={form.lecture_credits}
                  onChange={(e) => setForm({ ...form, lecture_credits: e.target.value })}
                  className="border p-2 rounded w-1/3 text-center"
                />
                <input
                  placeholder="T"
                  value={form.tutorial_credits}
                  onChange={(e) => setForm({ ...form, tutorial_credits: e.target.value })}
                  className="border p-2 rounded w-1/3 text-center"
                />
                <input
                  placeholder="P"
                  value={form.lab_credits}
                  onChange={(e) => setForm({ ...form, lab_credits: e.target.value })}
                  className="border p-2 rounded w-1/3 text-center"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Credits</label>
              <input
                placeholder="Total"
                value={form.total_credits}
                onChange={(e) => setForm({ ...form, total_credits: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hours/Week</label>
            <input
              placeholder="Enter hours per week"
              value={form.hours_per_week}
              onChange={(e) => setForm({ ...form, hours_per_week: e.target.value })}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-primary text-white rounded">
              {editingId ? 'Update Course' : 'Add Course'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="px-4 py-2 bg-neutral-200 rounded">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        {courses.map(c => (
          <div key={c.id} className="p-2 border rounded mb-2 flex justify-between items-center">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-neutral-600">Dept: {c.department_name || c.department_id} • {c.hours_per_week} hrs/week</div>
            </div>
            <div>
              <button onClick={() => startEdit(c)} className="px-3 py-1 bg-neutral-100 rounded mr-2">Edit</button>
              <button onClick={async () => { if (confirm('Delete course?')) { await fetch(`/api/courses/${c.id}`, { method: 'DELETE' }); fetchCourses() } }} className="px-3 py-1 bg-red-50 text-red-700 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
