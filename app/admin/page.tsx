"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
// Add this import at the top with other imports
import { Button } from "@/components/ui/button"


export default function AdminPage() {
  const [departments, setDepartments] = useState<any[]>([])
  const [faculties, setFaculties] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [deptForm, setDeptForm] = useState({ name: "", code: "" })
  const [facultyForm, setFacultyForm] = useState({ name: "", email: "", department_id: "", specialization: "", default_password: "" })
  const [courseForm, setCourseForm] = useState({ code: "", name: "", department_id: "", credits: 0, semester: 1, hours_per_week: 0, lecture_credits: 0, tutorial_credits: 0, lab_credits: 0 })
  const [classForm, setClassForm] = useState({ name: "", capacity: 0, location: "" })

  useEffect(() => {
    fetchAll()
  }, [])

  const router = useRouter()

  async function fetchAll() {
    await Promise.all([fetchDepartments(), fetchFaculties(), fetchCourses(), fetchClassrooms(), fetchRequests()])
  }

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

  async function fetchCourses() {
    const res = await fetch('/api/courses')
    const data = await res.json()
    setCourses(data || [])
  }

  async function fetchClassrooms() {
    const res = await fetch('/api/classrooms')
    const data = await res.json()
    setClassrooms(data || [])
  }

  async function fetchRequests() {
    const token = localStorage.getItem("auth_token")
    const res = await fetch('/api/admin/requests', {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
    const data = await res.json()
    setRequests(data || [])
  }

  async function updateRequestStatus(requestId: number, status: string) {
    const token = localStorage.getItem("auth_token")
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": 'application/json'
        },
        body: JSON.stringify({ requestId, status })
      })
      if (res.ok) {
        fetchRequests() // Refresh the requests list
      }
    } catch (error) {
      console.error('Update request status error:', error)
    }
  }

  async function createDepartment(e: any) {
    e.preventDefault(); setLoading(true)
    try {
      const res = await fetch('/api/departments', { method: 'POST', body: JSON.stringify(deptForm), headers: { 'Content-Type': 'application/json' } })
      const body = await res.json().catch(()=>null)
      if (!res.ok) {
        console.error('Create department failed', res.status, body)
        alert('Failed to create department — check console for details')
        return
      }
      setDeptForm({ name: "", code: "" })
      fetchDepartments()
      router.push('/admin#departments')
    } finally { setLoading(false) }
  }

  async function createFaculty(e: any) {
    e.preventDefault(); setLoading(true)
    try {
      const res = await fetch('/api/faculties', { method: 'POST', body: JSON.stringify(facultyForm), headers: { 'Content-Type': 'application/json' } })
      const body = await res.json().catch(()=>null)
      if (!res.ok) { console.error('Create faculty failed', res.status, body); alert('Failed to create faculty — check console'); return }
      setFacultyForm({ name: "", email: "", department_id: "", specialization: "", default_password: "" })
      fetchFaculties()
      router.push('/admin#faculties')
    } finally { setLoading(false) }
  }

  async function createCourse(e: any) {
    e.preventDefault(); setLoading(true)
    try {
      const res = await fetch('/api/courses', { method: 'POST', body: JSON.stringify(courseForm), headers: { 'Content-Type': 'application/json' } })
      const body = await res.json().catch(()=>null)
      if (!res.ok) { console.error('Create course failed', res.status, body); alert('Failed to create course — check console'); return }
      setCourseForm({ code: "", name: "", department_id: "", credits: 0, semester: 1, hours_per_week: 0, lecture_credits: 0, tutorial_credits: 0, lab_credits: 0 })
      fetchCourses()
      router.push('/admin#courses')
    } finally { setLoading(false) }
  }

  async function createClassroom(e: any) {
    e.preventDefault(); setLoading(true)
    try {
      const res = await fetch('/api/classrooms', { method: 'POST', body: JSON.stringify(classForm), headers: { 'Content-Type': 'application/json' } })
      const body = await res.json().catch(()=>null)
      if (!res.ok) { console.error('Create classroom failed', res.status, body); alert('Failed to create classroom — check console'); return }
      setClassForm({ name: "", capacity: 0, location: "" })
      fetchClassrooms()
      router.push('/admin#classrooms')
    } finally { setLoading(false) }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin — Manage Data</h1>

      <nav className="mb-6 flex gap-2">
        <Link href="/admin/departments" className="px-3 py-2 bg-neutral-100 rounded">Departments</Link>
        <Link href="/admin/faculties" className="px-3 py-2 bg-neutral-100 rounded">Faculties</Link>
        <Link href="/admin/courses" className="px-3 py-2 bg-neutral-100 rounded">Courses</Link>
        <Link href="/admin/classrooms" className="px-3 py-2 bg-neutral-100 rounded">Classrooms</Link>
        <Link href="/admin#requests" className="px-3 py-2 bg-red-100 text-red-700 rounded font-medium">
          Faculty Requests ({requests.filter(r => r.status === 'pending').length})
        </Link>
      </nav>

<div className="mb-6">
  <Link href="/faculty-assignments">
    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
      Go to Faculty Assignments
    </Button>
  </Link>
</div>
      <div className="mb-6">
        <Link href="/faculty-assignments">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
            Go to Faculty Assignments
          </button>
        </Link>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div id="departments" className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Departments</h2>
          <div className="mb-4">
            <Link href="/admin/departments" className="px-4 py-2 bg-primary text-white rounded">Manage Departments</Link>
          </div>
          <div className="mt-4">
            {departments.map(d => (
              <div key={d.id} className="p-2 border rounded mb-2 flex justify-between items-center">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-sm text-neutral-600">{d.code}</div>
                </div>
                <div>
                  <button onClick={async ()=>{ const newName = prompt('New name', d.name); if(newName){ await fetch(`/api/departments/${d.id}`, { method: 'PATCH', body: JSON.stringify({ name: newName }), headers: { 'Content-Type':'application/json' } }); fetchDepartments() } }} className="px-3 py-1 bg-neutral-100 rounded mr-2">Edit</button>
                  <button onClick={async ()=>{ if(confirm('Delete department?')){ await fetch(`/api/departments/${d.id}`, { method: 'DELETE' }); fetchDepartments() } }} className="px-3 py-1 bg-red-50 text-red-700 rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="classrooms" className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Classrooms</h2>
          <div className="mb-4">
            <Link href="/admin/classrooms" className="px-4 py-2 bg-primary text-white rounded">Manage Classrooms</Link>
          </div>
          <div className="mt-4">
            {classrooms.map(c => (
              <div key={c.id} className="p-2 border rounded mb-2 flex justify-between items-center">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-neutral-600">Capacity: {c.capacity} • {c.location}</div>
                </div>
                <div>
                  <button onClick={async ()=>{ const newName = prompt('New name', c.name); if(newName){ await fetch(`/api/classrooms/${c.id}`, { method: 'PATCH', body: JSON.stringify({ name: newName }), headers: { 'Content-Type':'application/json' } }); fetchClassrooms() } }} className="px-3 py-1 bg-neutral-100 rounded mr-2">Edit</button>
                  <button onClick={async ()=>{ if(confirm('Delete classroom?')){ await fetch(`/api/classrooms/${c.id}`, { method: 'DELETE' }); fetchClassrooms() } }} className="px-3 py-1 bg-red-50 text-red-700 rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div id="faculties" className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Faculties</h2>
          <div className="mb-4">
            <Link href="/admin/faculties" className="px-4 py-2 bg-primary text-white rounded">Manage Faculties</Link>
          </div>

          <div>
            {faculties.map((f) => (
              <div key={f.id} className="p-2 border rounded mb-2 flex justify-between items-center">
                <div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-sm text-neutral-600">{f.email} • {f.specialization}</div>
                </div>
                <div>
                  <button onClick={async () => {
                    const newName = prompt('New name', f.name)
                    if (newName) {
                      await fetch(`/api/faculties/${f.id}`, { method: 'PATCH', body: JSON.stringify({ name: newName }), headers: { 'Content-Type': 'application/json' } })
                      fetchFaculties()
                    }
                  }} className="px-3 py-1 bg-neutral-100 rounded mr-2">Edit</button>
                  <button onClick={async () => { if (confirm('Delete faculty?')) { await fetch(`/api/faculties/${f.id}`, { method: 'DELETE' }); fetchFaculties() } }} className="px-3 py-1 bg-red-50 text-red-700 rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="courses" className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Courses</h2>
          <div className="mb-4">
            <Link href="/admin/courses" className="px-4 py-2 bg-primary text-white rounded">Manage Courses</Link>
          </div>

          <div>
            {courses.map((c) => (
              <div key={c.id} className="p-2 border rounded mb-2 flex justify-between items-center">
                <div>
                  <div className="font-medium">{c.code} — {c.name}</div>
                  <div className="text-sm text-neutral-600">Credits: {c.credits} • Semester: {c.semester} • Hours/wk: {c.hours_per_week}</div>
                </div>
                <div>
                  <button onClick={async () => {
                    const newName = prompt('New course name', c.name)
                    if (newName) {
                      await fetch(`/api/courses/${c.id}`, { method: 'PATCH', body: JSON.stringify({ name: newName }), headers: { 'Content-Type': 'application/json' } })
                      fetchCourses()
                    }
                  }} className="px-3 py-1 bg-neutral-100 rounded mr-2">Edit</button>
                  <button onClick={async () => { if (confirm('Delete course?')) { await fetch(`/api/courses/${c.id}`, { method: 'DELETE' }); fetchCourses() } }} className="px-3 py-1 bg-red-50 text-red-700 rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="requests" className="bg-white p-6 rounded shadow">
        <h2 className="font-semibold mb-4">Faculty Requests</h2>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border rounded p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{request.title}</h3>
                  <p className="text-sm text-neutral-600">
                    {request.faculty_name} ({request.faculty_email}) • {request.type}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </span>
                  {request.status === 'pending' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateRequestStatus(request.id, 'approved')}
                        className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateRequestStatus(request.id, 'rejected')}
                        className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs hover:bg-red-100"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-neutral-700">{request.description}</p>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="text-center text-neutral-500 py-8">
              No faculty requests found.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
