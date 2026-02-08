import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const db = await getDb()
    const [rows] = await db.execute("SELECT id, name, capacity, location FROM classrooms")
    return NextResponse.json(rows)
  } catch (error) {
    console.error("[v0] Error fetching classrooms:", error)
    return NextResponse.json({ error: "Failed to fetch classrooms" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, capacity, location } = await request.json()
    const db = await getDb()
    const [result] = await db.execute("INSERT INTO classrooms (name, capacity, location) VALUES (?, ?, ?)", [name, capacity, location])
    return NextResponse.json({ success: true, id: (result as any).insertId }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating classroom:', error)
    return NextResponse.json({ error: 'Failed to create classroom' }, { status: 500 })
  }
}
