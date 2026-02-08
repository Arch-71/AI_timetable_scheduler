// app/api/schedules/versions/route.ts
import { getDb } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const db = await getDb();

  try {
    // Fetch all timetable versions
    const [versions] = await db.execute(`
      SELECT * FROM timetable_versions 
      ORDER BY created_at DESC 
      LIMIT 20
    `) as [any[], any];

    return NextResponse.json({
      versions: versions
    });

  } catch (error) {
    console.error("Error fetching timetable versions:", error);
    return NextResponse.json(
      { error: "Failed to fetch timetable versions" },
      { status: 500 }
    );
  }
}
