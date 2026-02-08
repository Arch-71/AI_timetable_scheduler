import { getDb } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const db = await getDb()
    const [rows] = await db.execute(`
      SELECT s.id, s.course_id, s.faculty_id, s.classroom_id, s.time_slot_id, 
             s.schedule_date, s.status, c.code as course_code, c.name as course_name,
             f.name as faculty_name, cl.name as classroom_name, 
             t.start_time, t.end_time
      FROM schedules s
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN faculties f ON s.faculty_id = f.id
      LEFT JOIN classrooms cl ON s.classroom_id = cl.id
      LEFT JOIN time_slots t ON s.time_slot_id = t.id
      ORDER BY s.schedule_date, t.start_time
    `)
    return NextResponse.json(rows)
  } catch (error) {
    console.error("[v0] Error fetching schedules:", error)
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { course_id, faculty_id, classroom_id, time_slot_id, schedule_date, created_by } = await request.json()
    const db = await getDb()

    const [result] = await db.execute(
      "INSERT INTO schedules (course_id, faculty_id, classroom_id, time_slot_id, schedule_date, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [course_id, faculty_id, classroom_id, time_slot_id, schedule_date, "draft", created_by],
    )

    return NextResponse.json({ success: true, id: (result as any).insertId }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating schedule:", error)
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json()
    const db = await getDb()

    await db.execute("UPDATE schedules SET status = ? WHERE id = ?", [status, id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating schedule:", error)
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 })
  }
}
