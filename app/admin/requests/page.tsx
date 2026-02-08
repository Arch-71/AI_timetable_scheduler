"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function FacultyRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    const token = localStorage.getItem("auth_token")
    try {
      const res = await fetch('/api/admin/requests', {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      const data = await res.json()
      setRequests(data || [])
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown date'
  
  try {
    const date = new Date(dateString)
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Date error'
  }
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8 text-neutral-600">Loading requests...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Faculty Requests</h1>
          <p className="text-neutral-600">Manage faculty requests for schedule changes, room assignments, and other academic needs</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard">
            <Button variant="outline" className="border-neutral-300 text-neutral-700 hover:bg-neutral-50">
              Back to Dashboard
            </Button>
          </Link>
          <Button onClick={fetchRequests} className="bg-primary hover:bg-primary-dark text-white">
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-neutral-900">{request.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-neutral-600 mt-1">
                    <span className="font-medium">{request.faculty_name}</span>
                    <span className="text-neutral-400">({request.faculty_email})</span>
                    <span className="px-2 py-1 bg-neutral-100 rounded text-xs font-medium">
                      {request.type}
                    </span>
                    <span className="text-neutral-500">
                      {formatDate(request.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </span>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateRequestStatus(request.id, 'approved')}
                        className="px-3 py-1 bg-green-50 text-green-700 rounded text-sm hover:bg-green-100 font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateRequestStatus(request.id, 'rejected')}
                        className="px-3 py-1 bg-red-50 text-red-700 rounded text-sm hover:bg-red-100 font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-neutral-50 rounded p-3">
                <p className="text-sm text-neutral-700 leading-relaxed">{request.description}</p>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              <div className="text-lg font-medium mb-2">No faculty requests found</div>
              <p className="text-sm">When faculty submit requests, they will appear here for your review.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
