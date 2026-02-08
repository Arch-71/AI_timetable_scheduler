import { getDb } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, description, created_by } = await request.json();

    if (!name || created_by === undefined) {
      return NextResponse.json(
        { error: "Name and created_by are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const [result] = await db.execute(
      "INSERT INTO timetable_versions (name, description, status, created_by) VALUES (?, ?, ?, ?)",
      [name, description || null, "draft", created_by],
    );

    return NextResponse.json({ 
      success: true,
      id: result.insertId 
    });
  } catch (error) {
    console.error("Error creating timetable version:", error);
    return NextResponse.json(
      { error: "Failed to create timetable version" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDb()
    const [rows] = await db.execute("SELECT * FROM timetable_versions ORDER BY created_at DESC")
    return NextResponse.json(rows)
  } catch (error) {
    console.error("[v0] Error fetching timetable versions:", error)
    return NextResponse.json({ error: "Failed to fetch timetable versions" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status, notes, approved_by } = await request.json()
    const db = await getDb()

    const approvedBy = status === "approved" ? approved_by : null

    await db.execute("UPDATE timetable_versions SET status = ?, updated_at = NOW() WHERE id = ?", [status, id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating timetable version:", error)
    return NextResponse.json({ error: "Failed to update timetable version" }, { status: 500 })
  }
}
