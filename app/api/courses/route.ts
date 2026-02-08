import { getDb } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const departmentId = request.nextUrl.searchParams.get("department_id")
    const db = await getDb()

    let query = `
      SELECT 
        id, code, name, department_id, 
        course_type, lecture_credits, 
        tutorial_credits, lab_credits, 
        credits, hours_per_week, semester,
        (lecture_credits + tutorial_credits + lab_credits) as total_credits
      FROM courses
    `
    const params: any[] = []

    if (departmentId) {
      query += " WHERE department_id = ?"
      params.push(departmentId)
    }

    const [rows] = await db.execute(query, params)
    console.log("Courses query result:", rows)
    console.log("Number of courses:", Array.isArray(rows) ? rows.length : 0)
    return NextResponse.json(rows)
  } catch (error) {
    console.error("[v0] Error fetching courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      code, 
      name, 
      department_id, 
      course_type,
      lecture_credits,
      tutorial_credits,
      lab_credits,
      hours_per_week
    } = await request.json()
    
    // Calculate semester based on course code
    let semester = 1
    if (code && code.toLowerCase().includes('mmc3')) {
      semester = 3
    } else if (code && code.toLowerCase().includes('mmc1')) {
      semester = 1
    }
    
    // Calculate total credits from LTP components
    const totalCredits = (lecture_credits || 0) + (tutorial_credits || 0) + (lab_credits || 0)
    
    const db = await getDb()

    const [result] = await db.execute(
      `INSERT INTO courses (
        code, name, department_id, 
        course_type, lecture_credits, 
        tutorial_credits, lab_credits, 
        credits, hours_per_week, semester
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, 
        name, 
        department_id,
        course_type,
        lecture_credits || 0,
        tutorial_credits || 0,
        lab_credits || 0,
        totalCredits, // Use calculated total credits
        hours_per_week || 0,
        semester
      ],
    )

    return NextResponse.json({ success: true, id: (result as any).insertId }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating course:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}