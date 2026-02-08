"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"

interface StudentRow {
  usn: string
  name: string
  email: string
}

export function BulkUploadStudents() {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<StudentRow[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = (text: string): StudentRow[] => {
    const lines = text.trim().split("\n")
    const rows: StudentRow[] = []

    // Skip header row (first line)
    for (let i = 1; i < lines.length; i++) {
      const [usn, name, email] = lines[i].split(",").map((s) => s.trim())
      if (usn && name && email) {
        rows.push({ usn, name, email })
      }
    }

    return rows
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files[0]) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a CSV file")
      return
    }

    setFile(selectedFile)
    setError("")

    const text = await selectedFile.text()
    const rows = parseCSV(text)

    if (rows.length === 0) {
      setError("No valid student data found in CSV")
      return
    }

    setPreview(rows)
  }

  const handleUpload = async () => {
    if (preview.length === 0) return

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/students/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: preview }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      const result = await response.json()
      setSuccess(`Successfully added ${result.count} students`)
      setPreview([])
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? "border-primary bg-blue-50" : "border-neutral-300 bg-neutral-50"
        }`}
      >
        <div className="space-y-2">
          <div className="text-4xl">📁</div>
          <h3 className="text-lg font-semibold">Drag CSV file here or click to browse</h3>
          <p className="text-sm text-neutral-600">Format: USN, Name, Email (one per line)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click()
              }
            }}
            className="inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            disabled={loading}
          >
            Browse Files
          </button>
        </div>
      </div>

      {/* Error & Success Messages */}
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}
      {success && <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded">{success}</div>}

      {/* CSV Format Example */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <h4 className="font-semibold text-sm mb-2">CSV Format Example:</h4>
        <pre className="text-xs bg-white p-2 rounded border">
{`USN,Name,Email
USN001,<student name>,<student mail>`}
        </pre>
        <p className="text-xs text-neutral-600 mt-2">
          • All students will be created with default password: <strong>Welcome@123</strong>
          <br />• Students must change password on first login
        </p>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{preview.length} students ready to upload</h3>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setPreview([])
                  setFile(null)
                }}
                variant="outline"
                disabled={loading}
              >
                Clear
              </Button>
              <Button onClick={handleUpload} disabled={loading} className="bg-primary text-white">
                {loading ? "Uploading..." : "Upload Students"}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-100 border">
                  <th className="px-4 py-2 text-left border">USN</th>
                  <th className="px-4 py-2 text-left border">Name</th>
                  <th className="px-4 py-2 text-left border">Email</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((student, idx) => (
                  <tr key={idx} className="border hover:bg-neutral-50">
                    <td className="px-4 py-2 border">{student.usn}</td>
                    <td className="px-4 py-2 border">{student.name}</td>
                    <td className="px-4 py-2 border">{student.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 10 && (
              <p className="text-xs text-neutral-600 mt-2">
                ... and {preview.length - 10} more students
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
