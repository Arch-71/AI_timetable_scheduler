// app/admin/faculties/page.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function FacultiesAdmin() {
  const [departments, setDepartments] = useState<any[]>([])
  const [faculties, setFaculties] = useState<any[]>([])
  const [form, setForm] = useState({
    name: "",
    short_name: "",
    email: "",
    department_id: "",
    specialization: ""
  })
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchDepartments()
    fetchFaculties()
  }, [])

  async function fetchDepartments() {
    const res = await fetch('/api/departments')
    const data = await res.json()
    setDepartments(data || [])
  }

  async function fetchFaculties() {
    const res = await fetch('/api/faculties')
    const data = await res.json()
    setFaculties(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editingId ? `/api/faculties/${editingId}` : '/api/faculties'
      const method = editingId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save faculty')
      }

      setForm({
        name: "",
        short_name: "",
        email: "",
        department_id: "",
        specialization: ""
      })
      setEditingId(null)
      fetchFaculties()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save faculty')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(faculty: any) {
    setEditingId(faculty.id)
    setForm({
      name: faculty.name,
      short_name: faculty.short_name || "",
      email: faculty.email,
      department_id: faculty.department_id,
      specialization: faculty.specialization || ""
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({
      name: "",
      short_name: "",
      email: "",
      department_id: "",
      specialization: ""
    })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Link href="/dashboard" className="px-3 py-2 bg-neutral-100 rounded">← Back to Dashboard</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">Faculties</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-4">{editingId ? 'Edit Faculty' : 'Add Faculty Form'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              placeholder="Enter full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Short Name (e.g., RMR, SU)</label>
            <input
              type="text"
              placeholder="Enter short name (max 5 chars)"
              value={form.short_name}
              onChange={(e) => setForm({ ...form, short_name: e.target.value.toUpperCase() })}
              className="border p-2 rounded w-full"
              maxLength={5}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Used in timetable display</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value })}
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Select department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">courses</label>
            <input
              placeholder="Enter courses"
              value={form.specialization}
              onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="flex gap-2">
            <button
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
            >
              {loading ? 'Saving...' : (editingId ? 'Update Faculty' : 'Add Faculty')}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="px-4 py-2 bg-neutral-200 rounded">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-2">
        {faculties.map(f => (
          <div key={f.id} className="p-4 border rounded flex justify-between items-center">
            <div>
              <div className="font-medium">
                {f.name}
                {f.short_name && (
                  <span className="ml-2 inline-block bg-gray-100 px-2 py-0.5 rounded text-xs">
                    {f.short_name}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {f.email} • {f.specialization}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => startEdit(f)}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  if (confirm('Delete faculty?')) {
                    try {
                      await fetch(`/api/faculties/${f.id}`, { method: 'DELETE' })
                      fetchFaculties()
                    } catch (error) {
                      alert('Failed to delete faculty')
                    }
                  }
                }}
                className="px-3 py-1 bg-red-50 text-red-700 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}