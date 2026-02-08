import { getDb } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { courseName, facultyName, room, section, day, timeSlot, isExtra } = await request.json()

    // Validate required fields
    if (!courseName || !facultyName || !room || !section || !day || !timeSlot) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const db = await getDb()

    // Parse time slot to get start and end times
    const [startTime, endTime] = timeSlot.split('-')

    // Convert day name to day number
    const dayMap: { [key: string]: number } = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
      'Sunday': 7
    }
    const dayOfWeek = dayMap[day] || 1

    // Get or find course ID (create if doesn't exist)
    const [existingCourse] = await db.execute(
      "SELECT id FROM courses WHERE name = ?",
      [courseName]
    )

    let courseId: number
    if (Array.isArray(existingCourse) && existingCourse.length > 0) {
      courseId = (existingCourse[0] as any).id
    } else {
      // Create new course
      const [courseResult] = await db.execute(
        "INSERT INTO courses (name, code, department_id, credits, semester, hours_per_week) VALUES (?, ?, ?, ?, ?, ?)",
        [courseName, courseName.substring(0, 10).toUpperCase(), 1, 3, 1, 3]
      )
      courseId = (courseResult as any).insertId
    }

    // Get or find faculty ID (create if doesn't exist)
    const [existingFaculty] = await db.execute(
      "SELECT id FROM faculties WHERE name = ?",
      [facultyName]
    )

    let facultyId: number
    if (Array.isArray(existingFaculty) && existingFaculty.length > 0) {
      facultyId = (existingFaculty[0] as any).id
    } else {
      // Create new faculty
      const [facultyResult] = await db.execute(
        "INSERT INTO faculties (name, email, department_id, specialization) VALUES (?, ?, ?, ?)",
        [facultyName, `${facultyName.toLowerCase().replace(' ', '.')}@example.com`, 1, facultyName]
      )
      facultyId = (facultyResult as any).insertId
    }

    // Get or find classroom ID (create if doesn't exist)
    const [existingRoom] = await db.execute(
      "SELECT id FROM classrooms WHERE name = ?",
      [room]
    )

    let roomId: number
    if (Array.isArray(existingRoom) && existingRoom.length > 0) {
      roomId = (existingRoom[0] as any).id
    } else {
      // Create new classroom
      const [roomResult] = await db.execute(
        "INSERT INTO classrooms (name, capacity, location) VALUES (?, ?, ?)",
        [room, 30, room]
      )
      roomId = (roomResult as any).insertId
    }

    // Get or find time slot ID (create if doesn't exist)
    const [existingTimeSlot] = await db.execute(
      "SELECT id FROM time_slots WHERE day_of_week = ? AND start_time = ? AND end_time = ?",
      [dayOfWeek, startTime, endTime]
    )

    let timeSlotId: number
    if (Array.isArray(existingTimeSlot) && existingTimeSlot.length > 0) {
      timeSlotId = (existingTimeSlot[0] as any).id
    } else {
      // Create new time slot
      const [timeSlotResult] = await db.execute(
        "INSERT INTO time_slots (day_of_week, start_time, end_time) VALUES (?, ?, ?)",
        [dayOfWeek, startTime, endTime]
      )
      timeSlotId = (timeSlotResult as any).insertId
    }

    // Insert the new schedule
    const [result] = await db.execute(
      `INSERT INTO schedules (course_id, faculty_id, classroom_id, time_slot_id, created_by, is_extra, section) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [courseId, facultyId, roomId, timeSlotId, 1, isExtra ? 1 : 0, section] // Using admin user ID 1 as created_by
    )

    // Add to the latest timetable version
    const [latestVersion] = await db.execute(
      "SELECT id FROM timetable_versions ORDER BY created_at DESC LIMIT 1"
    )

    if (Array.isArray(latestVersion) && latestVersion.length > 0) {
      const versionId = (latestVersion[0] as any).id
      const scheduleId = (result as any).insertId

      await db.execute(
        "INSERT INTO version_schedules (timetable_version_id, schedule_id) VALUES (?, ?)",
        [versionId, scheduleId]
      )
    }

    return NextResponse.json({
      success: true,
      id: (result as any).insertId,
      message: "Class added successfully to timetable"
    })
  } catch (error) {
    console.error("Error adding class to timetable:", error)
    return NextResponse.json({ error: "Failed to add class to timetable" }, { status: 500 })
  }
}
