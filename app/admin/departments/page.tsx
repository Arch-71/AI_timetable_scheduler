"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function DepartmentsAdmin() {
  const [departments, setDepartments] = useState<any[]>([])
  const [form, setForm] = useState({ name: "", code: "" })
  const [loading, setLoading] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => { fetchDepartments() }, [])

  async function fetchDepartments() {
    const res = await fetch('/api/departments')
    const data = await res.json()
    setDepartments(data || [])
  }

  async function handleSubmit(e: any) {
    e.preventDefault(); setLoading(true)
    try {
      if (editingId) {
        await fetch(`/api/departments/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
          headers: { 'Content-Type': 'application/json' }
        })
      } else {
        await fetch('/api/departments', {
          method: 'POST',
          body: JSON.stringify(form),
          headers: { 'Content-Type': 'application/json' }
        })
      }
      setForm({ name: "", code: "" })
      setEditingId(null)
      fetchDepartments()
    } finally { setLoading(false) }
  }

  function startEdit(dept: any) {
    setEditingId(dept.id)
    setForm({ name: dept.name, code: dept.code })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ name: "", code: "" })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Link href="/dashboard" className="px-3 py-2 bg-neutral-100 rounded">← Back to Dashboard</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">Departments</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-4">{editingId ? 'Edit Department' : 'Add Department Form'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Department Name</label>
            <input placeholder="Enter department name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Short Code</label>
            <input placeholder="Enter short code (e.g., CS, ENG)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="border p-2 rounded w-full" />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-primary text-white rounded">
              {editingId ? 'Update Department' : 'Add Department'}
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
        {departments.map(d => (
          <div key={d.id} className="p-2 border rounded mb-2 flex justify-between items-center">
            <div>
              <div className="font-medium">{d.name}</div>
              <div className="text-sm text-neutral-600">{d.code}</div>
            </div>
            <div>
              <button onClick={() => startEdit(d)} className="px-3 py-1 bg-neutral-100 rounded mr-2">Edit</button>
              <button onClick={async () => { if (confirm('Delete department?')) { await fetch(`/api/departments/${d.id}`, { method: 'DELETE' }); fetchDepartments() } }} className="px-3 py-1 bg-red-50 text-red-700 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
