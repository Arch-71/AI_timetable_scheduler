import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

// Timetable Excel export endpoint
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();

    // Fetch full schedule with joins for course, faculty, classroom, and time slot
    const [rows] = await db.execute(`
      SELECT s.*, c.name as course_name, f.initials as faculty_initials, r.name as classroom_name,
             t.day_of_week, t.start_time, t.end_time
      FROM schedules s
      JOIN courses c ON s.course_id = c.id
      JOIN faculties f ON s.faculty_id = f.id
      JOIN classrooms r ON s.classroom_id = r.id
      JOIN time_slots t ON s.time_slot_id = t.id
      WHERE s.status = 'draft'
      ORDER BY t.day_of_week, t.start_time
    `) as [any[], any];

    // Get unique days and time slots for header structure
    const days = [...new Set(rows.map(r => r.day_of_week))];
    const timeSlots = [...new Set(rows.map(r => `${r.start_time}-${r.end_time}`))];

    // Build a 2D map: timetable[day][slot] = { course, faculty, classroom }
    const timetable: Record<string, Record<string, any>> = {};
    for (const row of rows) {
      if (!timetable[row.day_of_week]) timetable[row.day_of_week] = {};
      timetable[row.day_of_week][`${row.start_time}-${row.end_time}`] = {
        course: row.course_name,
        faculty: row.faculty_initials,
        classroom: row.classroom_name,
      };
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Timetable");

    // Header row: first cell empty, then days
    sheet.addRow(["Time/Day", ...days]);

    // Fill timetable rows
    for (const slot of timeSlots) {
      const row = [slot];
      for (const day of days) {
        const cell = timetable[day]?.[slot];
        if (cell) {
          row.push(`${cell.course}\n${cell.faculty}\n${cell.classroom}`);
        } else {
          row.push("");
        }
      }
      sheet.addRow(row);
    }

    // Formatting: wrap text
    sheet.eachRow(row => {
      row.eachCell(cell => {
        cell.alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
      });
    });

    // Write to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="timetable.xlsx"`,
      },
    });
  } catch (error) {
    console.error("[v0] Error exporting timetable to Excel:", error);
    return NextResponse.json({ error: "Failed to export timetable" }, { status: 500 });
  }
}
