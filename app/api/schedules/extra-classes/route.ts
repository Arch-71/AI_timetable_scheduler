// app/api/schedules/extra-classes/route.ts
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const db = await getDb();

  try {
    const [extraClasses] = await db.execute(`
      SELECT s.*, 
             c.code as course_code,
             c.semester as semester,
             s.section,
             f.name as faculty_name,
             r.name as room_name, 
             ts.day_of_week,
             ts.start_time,
             ts.end_time
      FROM schedules s
      JOIN courses c ON s.course_id = c.id
      JOIN faculties f ON s.faculty_id = f.id
      JOIN classrooms r ON s.classroom_id = r.id
      JOIN time_slots ts ON s.time_slot_id = ts.id
      WHERE s.is_extra = 1
      ORDER BY ts.day_of_week, ts.start_time
    `);

    return NextResponse.json({ timetable: extraClasses });
  } catch (error) {
    console.error('Error fetching extra classes:', error);
    return NextResponse.json(
      { error: "Failed to fetch extra classes" },
      { status: 500 }
    );
  }
}