"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface ReviewActionsProps {
  versionId?: number
  status: "draft" | "pending" | "approved" | "rejected"
}

export function ReviewActions({ versionId, status }: ReviewActionsProps) {
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState("")
  const router = useRouter()

  const handleApprove = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/timetable-versions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: versionId, status: "approved", notes }),
      })

      if (!response.ok) throw new Error("Failed to approve")
      router.push("/output")
    } catch (error) {
      alert("Failed to approve timetable")
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/timetable-versions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: versionId, status: "rejected", notes }),
      })

      if (!response.ok) throw new Error("Failed to reject")
      router.push("/generation")
    } catch (error) {
      alert("Failed to reject timetable")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-neutral-200 bg-neutral-50">
      <CardHeader>
        <CardTitle>Review & Action</CardTitle>
        <CardDescription>Make a decision on this timetable version</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Review Notes</label>
          <textarea
            placeholder="Add comments or feedback..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleApprove}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white flex-1"
          >
            {loading ? "Processing..." : "Approve & Publish"}
          </Button>
          <Button onClick={handleReject} disabled={loading} variant="destructive" className="flex-1">
            Reject
          </Button>
        </div>

        <div className="pt-2 border-t border-neutral-200 text-xs text-neutral-600">
          <p>
            Current Status: <strong>{status}</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
