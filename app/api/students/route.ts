import { getDb } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const db = await getDb()
    const [rows] = await db.execute("SELECT id, usn, name, email, created_at FROM students ORDER BY created_at DESC")
    return NextResponse.json(rows)
  } catch (error) {
    console.error("[v0] Error fetching students:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}
