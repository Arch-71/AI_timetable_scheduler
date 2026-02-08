import { AdminProtectedRoute } from "@/components/admin-protected-route"
import { BulkUploadStudents } from "@/components/bulk-upload-students"
import Link from "next/link"

export default function AdminStudentsPage() {
  return (
    <AdminProtectedRoute>
       
      <div className="container mx-auto px-4 py-8">
       <div className="mb-2">
                <Link href="/dashboard" className="px-3 py-2 bg-neutral-100 rounded">← Back to Dashboard</Link>
              </div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Manage Students</h1>
          <p className="text-neutral-600">Upload student records in bulk via CSV or manage individually</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Bulk Upload Students</h2>
            <p className="text-sm text-neutral-600 mb-6">
              Upload a CSV file with student information. All students will be created with a default password and can change it on first login.
            </p>
          </div>
          <BulkUploadStudents />
        </div>
      </div>
    </AdminProtectedRoute>
  )
}
