"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FacultyProtectedRoute } from "@/components/faculty-protected-route"
import { TimetableViewer } from "@/components/TimetableViewer"

export default function FacultyPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"timetable" | "password" | "request">("timetable")
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [requestForm, setRequestForm] = useState({ title: "", description: "", type: "schedule-change" })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    try {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/faculty/requests", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      const data = await res.json()
      setRequests(data || [])
    } catch (error) {
      console.error("Error fetching requests:", error)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")
    setLoading(true)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage("New passwords do not match")
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/faculty/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to change password")
      }

      setMessage("Password changed successfully!")
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error changing password")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")
    setLoading(true)

    try {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/faculty/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestForm),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to submit request")
      }

      setMessage("Request submitted successfully!")
      setRequestForm({ title: "", description: "", type: "schedule-change" })
      fetchRequests()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error submitting request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <FacultyProtectedRoute>
      <div className="min-h-screen bg-neutral-50">
        <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Faculty Dashboard</h1>
                <p className="text-neutral-600">Welcome, {user?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("password")}
                  className="px-3 py-2 bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-50"
                >
                  Change Password
                </button>
                <button
                  onClick={() => {
                    logout()
                    router.push("/")
                  }}
                  className="px-4 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-4 mb-6 border-b border-neutral-200">
            <button
              onClick={() => setActiveTab("timetable")}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "timetable"
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
              }`}
            >
              My Timetable
            </button>
            
            <button
              onClick={() => setActiveTab("request")}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "request"
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Send Request ({requests.length})
            </button>
          </div>

          {activeTab === "timetable" && (
            <div>
              <TimetableViewer currentUser={user} />
            </div>
          )}

          {activeTab === "password" && (
            <div className="max-w-md bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Change Password</h2>

              {message && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm ${
                    message.includes("successfully")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    className="w-full border border-neutral-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    className="w-full border border-neutral-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    className="w-full border border-neutral-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <Button disabled={loading} className="w-full bg-primary hover:bg-primary-dark text-white">
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </div>
          )}

          {activeTab === "request" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white rounded-lg border border-neutral-200 p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Submit Request</h2>

                {message && (
                  <div
                    className={`mb-4 p-3 rounded-lg text-sm ${
                      message.includes("successfully")
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Request Type</label>
                    <select
                      value={requestForm.type}
                      onChange={(e) => setRequestForm({ ...requestForm, type: e.target.value })}
                      className="w-full border border-neutral-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="schedule-change">Schedule Change</option>
                      <option value="room-change">Room Change</option>
                      <option value="course-issue">Course Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Title</label>
                    <input
                      type="text"
                      placeholder="Enter request title"
                      value={requestForm.title}
                      onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                      required
                      className="w-full border border-neutral-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
                    <textarea
                      placeholder="Describe your request in detail"
                      value={requestForm.description}
                      onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                      required
                      rows={4}
                      className="w-full border border-neutral-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <Button disabled={loading} className="w-full bg-primary hover:bg-primary-dark text-white">
                    {loading ? "Submitting..." : "Submit Request"}
                  </Button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Your Requests</h2>

                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-neutral-600">No requests yet. Submit one to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((req) => (
                      <div key={req.id} className="border border-neutral-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-neutral-900">{req.title}</h3>
                            <p className="text-sm text-neutral-600">{req.type}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              req.status === "pending"
                                ? "bg-yellow-50 text-yellow-700"
                                : req.status === "approved"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                            }`}
                          >
                            {req.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600">{req.description}</p>
                        <p className="text-xs text-neutral-500 mt-2">
                          Submitted: {new Date(req.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </FacultyProtectedRoute>
  )
}
