import { getDb } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const db = await getDb()
    const [rows] = await db.execute("SELECT password_changed FROM students WHERE email = ?", [email])

    if (!Array.isArray(rows) || rows.length === 0) {
      // If student doesn't exist, treat as password not changed (should change on first access)
      return NextResponse.json({ password_changed: false })
    }

    const student = rows[0] as any
    return NextResponse.json({ password_changed: student.password_changed })
  } catch (error) {
    console.error("[v0] Error checking password status:", error)
    return NextResponse.json({ error: "Failed to check password status" }, { status: 500 })
  }
}
