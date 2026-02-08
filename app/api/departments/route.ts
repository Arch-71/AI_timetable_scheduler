import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const db = await getDb()
    const [rows] = await db.execute("SELECT id, name, code FROM departments")
    return NextResponse.json(rows)
  } catch (error) {
    console.error("[v0] Error fetching departments:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, code } = await request.json()
    const db = await getDb()
    const [result] = await db.execute("INSERT INTO departments (name, code) VALUES (?, ?)", [name, code])
    return NextResponse.json({ success: true, id: (result as any).insertId }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating department:', error)
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 })
  }
}
