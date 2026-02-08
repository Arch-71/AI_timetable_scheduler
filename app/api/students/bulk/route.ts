import { getDb } from "@/lib/db"
import { createUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { students } = await request.json()

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "No students provided" }, { status: 400 })
    }

    const db = await getDb()
    const DEFAULT_PASSWORD = "Welcome@123"
    let createdCount = 0
    const errors: string[] = []

    for (const student of students) {
      try {
        const { usn, name, email } = student

        if (!usn || !name || !email) {
          errors.push(`Skipped: Missing data for ${email || "unknown"}`)
          continue
        }

        // Check if student already exists
        const [existing] = await db.execute("SELECT id FROM students WHERE usn = ? OR email = ?", [
          usn,
          email,
        ])

        if (Array.isArray(existing) && existing.length > 0) {
          errors.push(`Skipped: Student ${email} already exists`)
          continue
        }

        // Create user account for student
        let userId: number | null = null
        try {
          const user = await createUser(email, DEFAULT_PASSWORD, name, "student")
          userId = user.id
        } catch (err) {
          errors.push(`Failed to create account for ${email}: ${err instanceof Error ? err.message : "Unknown error"}`)
          continue
        }

        // Insert into students table
        await db.execute(
          "INSERT INTO students (usn, name, email, user_id, created_at) VALUES (?, ?, ?, ?, NOW())",
          [usn, name, email, userId],
        )

        createdCount++
      } catch (err) {
        errors.push(`Error processing student: ${err instanceof Error ? err.message : "Unknown error"}`)
      }
    }

    return NextResponse.json(
      {
        success: true,
        count: createdCount,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully added ${createdCount} students. Default password: ${DEFAULT_PASSWORD}`,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Bulk upload error:", error)
    return NextResponse.json(
      { error: "Bulk upload failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
