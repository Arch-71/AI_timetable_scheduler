import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { versionId } = await request.json()
    const db = await getDb()

    // Fetch timetable data
    const [schedules] = await db.execute(
      `SELECT s.*, c.code as course_code, c.name as course_name, 
              f.name as faculty_name, cl.name as classroom_name, 
              t.start_time, t.end_time, t.day_of_week
       FROM schedules s
       LEFT JOIN courses c ON s.course_id = c.id
       LEFT JOIN faculties f ON s.faculty_id = f.id
       LEFT JOIN classrooms cl ON s.classroom_id = cl.id
       LEFT JOIN time_slots t ON s.time_slot_id = t.id
       WHERE s.status = 'approved'
       ORDER BY t.day_of_week, t.start_time`,
    )

    // Create CSV content
    let csvContent = "Course Code,Course Name,Faculty,Classroom,Day,Start Time,End Time,Date\n"

    if (Array.isArray(schedules)) {
      schedules.forEach((schedule: any) => {
        const row = [
          schedule.course_code,
          `"${schedule.course_name}"`,
          schedule.faculty_name,
          schedule.classroom_name,
          schedule.day_of_week,
          schedule.start_time,
          schedule.end_time,
          schedule.schedule_date,
        ].join(",")
        csvContent += row + "\n"
      })
    }

    // Return CSV for PDF generation (client will handle PDF creation)
    return NextResponse.json({
      success: true,
      data: schedules,
      csv: csvContent,
    })
  } catch (error) {
    console.error("[v0] Error exporting PDF:", error)
    return NextResponse.json({ error: "Failed to export PDF" }, { status: 500 })
  }
}
