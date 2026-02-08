import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const db = await getDb()
    const [rows] = await db.execute("SELECT id, start_time, end_time, day_of_week FROM time_slots")
    return NextResponse.json(rows)
  } catch (error) {
    console.error("[v0] Error fetching time slots:", error)
    return NextResponse.json({ error: "Failed to fetch time slots" }, { status: 500 })
  }
}
