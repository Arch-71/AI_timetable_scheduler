"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function ClassroomsAdmin() {
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [form, setForm] = useState({
    name: "",
    capacity: "",
    location: "",
    type: "classroom"
  })

  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => { fetchClassrooms() }, [])

  async function fetchClassrooms() {
    const res = await fetch('/api/classrooms')
    const data = await res.json()
    setClassrooms(data || [])
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    if (editingId) {
      await fetch(`/api/classrooms/${editingId}`, { method: 'PATCH', body: JSON.stringify(form), headers: { 'Content-Type': 'application/json' } })
    } else {
      await fetch('/api/classrooms', { method: 'POST', body: JSON.stringify(form), headers: { 'Content-Type': 'application/json' } })
    }
    setForm({ name: "", capacity: "", location: "", type: "classroom" })
    setEditingId(null)
    fetchClassrooms()
  }

  function startEdit(c: any) {
    setEditingId(c.id)
    setForm({
      name: c.name,
      capacity: c.capacity,
      location: c.location,
      type: c.type || "classroom"
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ name: "", capacity: "", location: "", type: "classroom" })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Link href="/dashboard" className="px-3 py-2 bg-neutral-100 rounded">← Back to Dashboard</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">Classrooms/Labs</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-4">{editingId ? 'Edit Classroom' : 'Add Classroom Form'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Room Name</label>
            <input placeholder="Enter room name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Capacity</label>
            <input placeholder="Enter capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input placeholder="Enter location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="border p-2 rounded w-full">
              <option value="classroom">Classroom</option>
              <option value="lab">Lab</option>
              <option value="special">Special (e.g. FDC)</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-primary text-white rounded">
              {editingId ? 'Update Classroom' : 'Add Classroom'}
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
        {classrooms.map(c => (
          <div key={c.id} className="p-2 border rounded mb-2 flex justify-between items-center">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-neutral-600">Capacity: {c.capacity} • Location: {c.location} • Type: {c.type}</div>
            </div>
            <div>
              <button onClick={() => startEdit(c)} className="px-3 py-1 bg-neutral-100 rounded mr-2">Edit</button>
              <button onClick={async () => { if (confirm('Delete classroom?')) { await fetch(`/api/classrooms/${c.id}`, { method: 'DELETE' }); fetchClassrooms() } }} className="px-3 py-1 bg-red-50 text-red-700 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
