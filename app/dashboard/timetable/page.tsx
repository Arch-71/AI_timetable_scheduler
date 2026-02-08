// app/dashboard/timetable/page.tsx
'use client';

import { AdminProtectedRoute } from "@/components/admin-protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { TimetableViewer } from '../../../components/TimetableViewer';
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"

export default function TimetablePage() {
  const { user: currentUser } = useAuth();
  console.log('TimetablePage currentUser:', currentUser);
  const [showAddClassModal, setShowAddClassModal] = useState(false)
  const [classForm, setClassForm] = useState({
    courseName: '',
    facultyName: '',
    room: '',
    section: 'I-A',
    day: 'Monday',
    timeSlot: '08:00-08:55'
  })

  const handleInputChange = (field: string, value: string) => {
    setClassForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddClass = async () => {
    // Validate form
    if (!classForm.courseName || !classForm.facultyName || !classForm.room) {
      alert('Please fill in all required fields')
      return
    }

    try {
      // Call the API to save the class
      const response = await fetch('/api/timetable/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseName: classForm.courseName,
          facultyName: classForm.facultyName,
          room: classForm.room,
          section: classForm.section,
          day: classForm.day,
          timeSlot: classForm.timeSlot,
          isExtra: true
        })
      })

      const result = await response.json()

      if (response.ok) {
        console.log('Class added successfully:', result)

        // Close the modal
        setShowAddClassModal(false)

        // Reset form
        setClassForm({
          courseName: '',
          facultyName: '',
          room: '',
          section: 'I-A',
          day: 'Monday',
          timeSlot: '08:00-08:55'
        })

        alert('Class added successfully to timetable!')

        // Refresh the timetable to show the new class
        window.location.reload()
      } else {
        console.error('Failed to add class:', result.error)
        alert(`Failed to add class: ${result.error}`)
      }
    } catch (error) {
      console.error('Error adding class:', error)
      alert('Failed to add class. Please try again.')
    }
  }

  return (
    <AdminProtectedRoute>
      <DashboardHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">View Timetable</h2>
              <p className="text-neutral-600">Browse and manage generated timetables</p>
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-primary hover:bg-primary-dark text-white"
                onClick={() => setShowAddClassModal(true)}
              >
                Add Class
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" className="border-neutral-300 text-neutral-700 hover:bg-neutral-50">Back to Dashboard</Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <TimetableViewer currentUser={currentUser} />
          </div>
        </div>
      </main>

      {/* Add Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Class</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Course Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Computer Science Fundamentals"
                  value={classForm.courseName}
                  onChange={(e) => handleInputChange('courseName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Faculty Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., KPS"
                  value={classForm.facultyName}
                  onChange={(e) => handleInputChange('facultyName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Room</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., CA1"
                  value={classForm.room}
                  onChange={(e) => handleInputChange('room', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Section</label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={classForm.section}
                  onChange={(e) => handleInputChange('section', e.target.value)}
                >
                  <option value="I-A">I-A</option>
                  <option value="I-B">I-B</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Day</label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={classForm.day}
                  onChange={(e) => handleInputChange('day', e.target.value)}
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Time Slot</label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={classForm.timeSlot}
                  onChange={(e) => handleInputChange('timeSlot', e.target.value)}
                >
                  <option value="08:00-08:55">08:00-08:55</option>
                  <option value="08:55-09:50">08:55-09:50</option>
                  <option value="09:50-10:45">09:50-10:45</option>
                  <option value="11:15-12:10">11:15-12:10</option>
                  <option value="12:10-01:05">12:10-01:05</option>
                  <option value="02:00-02:55">02:00-02:55</option>
                  <option value="02:55-03:50">02:55-03:50</option>
                  <option value="03:50-04:45">03:50-04:45</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                className="bg-primary hover:bg-primary-dark text-white flex-1"
                onClick={handleAddClass}
              >
                Add Class
              </Button>
              <Button
                variant="outline"
                className="border-neutral-300 text-neutral-700 hover:bg-neutral-50 flex-1"
                onClick={() => setShowAddClassModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminProtectedRoute>
  );
}