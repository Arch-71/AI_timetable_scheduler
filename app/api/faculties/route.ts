// app/api/faculties/route.ts
import { getDb } from "@/lib/db"
import { createUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const db = await getDb()
    const [faculties] = await db.execute(`
      SELECT f.*, d.name as department_name 
      FROM faculties f
      LEFT JOIN departments d ON f.department_id = d.id
      ORDER BY f.name
    `)
    return NextResponse.json(faculties)
  } catch (error) {
    console.error("Error fetching faculties:", error)
    return NextResponse.json(
      { error: "Failed to fetch faculties" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { name, short_name, email, department_id, specialization } = await request.json()
    const db = await getDb()
    
    // Default password for new faculty
    const DEFAULT_PASSWORD = "BmsceFaculty123"
    
    try {
      // Create user with default password and force password change
      await createUser(email, DEFAULT_PASSWORD, name, "faculty", true)
      
      // Create faculty record
      const [result] = await db.execute(
        "INSERT INTO faculties (name, short_name, email, department_id, specialization) VALUES (?, ?, ?, ?, ?)",
        [name, short_name, email, department_id, specialization]
      )

      return NextResponse.json({ 
        success: true,
        id: (result as any).insertId,
        message: "Faculty created successfully. They will be prompted to change their password on first login."
      })
    } catch (error: any) {
      console.error("Error creating faculty user:", error)
      return NextResponse.json(
        { error: error.message || "Failed to create faculty user" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error in faculty creation:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}