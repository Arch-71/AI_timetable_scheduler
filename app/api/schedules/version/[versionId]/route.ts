// app/api/schedules/version/[versionId]/route.ts
import { getDb } from "../../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const { versionId } = await params;
  const db = await getDb();

  try {
    // Get version details
    const [version] = await db.execute(
      "SELECT * FROM timetable_versions WHERE id = ?",
      [versionId]
    ) as [any[], any];

    if (version.length === 0) {
      return NextResponse.json(
        { error: "Timetable version not found" },
        { status: 404 }
      );
    }

    // Get schedules for this version
    const [schedules] = await db.execute(
      `SELECT 
        s.*,
        c.name as course_name,
        c.code as course_code,
        f.name as faculty_name,
        r.name as room_name,
        ts.day_of_week,
        ts.start_time,
        ts.end_time
      FROM schedules s
      JOIN version_schedules vs ON s.id = vs.schedule_id
      JOIN courses c ON s.course_id = c.id
      JOIN faculties f ON s.faculty_id = f.id
      JOIN classrooms r ON s.classroom_id = r.id
      JOIN time_slots ts ON s.time_slot_id = ts.id
      WHERE vs.timetable_version_id = ?
      ORDER BY ts.day_of_week, ts.start_time, r.name`,
      [versionId]
    ) as [any[], any];

    // Group by day and time slot for easier display
    const timetable = schedules.reduce((acc, schedule) => {
      // Convert day number to day name
      const dayMap = {
        1: 'monday',
        2: 'tuesday', 
        3: 'wednesday',
        4: 'thursday',
        5: 'friday',
        6: 'saturday',
        7: 'sunday'
      };
      
      const day = dayMap[schedule.day_of_week as keyof typeof dayMap] || 'monday';
      const timeKey = `${schedule.start_time}-${schedule.end_time}`;
      
      if (!acc[day]) acc[day] = {};
      if (!acc[day][timeKey]) acc[day][timeKey] = [];
      
      acc[day][timeKey].push({
        id: schedule.id,
        course: {
          id: schedule.course_id,
          name: schedule.course_name,
          code: schedule.course_code
        },
        faculty: {
          id: schedule.faculty_id,
          name: schedule.faculty_name
        },
        room: {
          id: schedule.classroom_id,
          name: schedule.room_name
        },
        timeSlot: {
          id: schedule.time_slot_id,
          day: schedule.day_of_week,
          startTime: schedule.start_time,
          endTime: schedule.end_time
        }
      });

      return acc;
    }, {});

    return NextResponse.json({
      version: version[0],
      timetable,
      rawSchedules: schedules
    });

  } catch (error) {
    console.error("Error fetching timetable version:", error);
    return NextResponse.json(
      { error: "Failed to fetch timetable version" },
      { status: 500 }
    );
  }
}