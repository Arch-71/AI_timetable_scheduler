import { getDb } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Decode token to get user email
    let userEmail: string
    try {
      const decoded = JSON.parse(Buffer.from(token, "base64").toString())
      userEmail = decoded.email
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await getDb()

    // Get user ID
    const [userRows] = await db.execute("SELECT id FROM users WHERE email = ?", [userEmail])
    if (!Array.isArray(userRows) || userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = (userRows[0] as any).id

    // Get requests
    const [requests] = await db.execute(
      "SELECT id, faculty_id, type, title, description, status, created_at FROM faculty_requests WHERE faculty_id = ? ORDER BY created_at DESC",
      [userId]
    )

    return NextResponse.json(requests || [])
  } catch (error) {
    console.error("Get requests error:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, title, description } = await request.json()
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!type || !title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Decode token to get user email
    let userEmail: string
    try {
      const decoded = JSON.parse(Buffer.from(token, "base64").toString())
      userEmail = decoded.email
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await getDb()

    // Get user ID
    const [userRows] = await db.execute("SELECT id FROM users WHERE email = ?", [userEmail])
    if (!Array.isArray(userRows) || userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = (userRows[0] as any).id

    // Insert request
    const [result] = await db.execute(
      "INSERT INTO faculty_requests (faculty_id, type, title, description, status) VALUES (?, ?, ?, ?, ?)",
      [userId, type, title, description, "pending"]
    )

    return NextResponse.json({
      success: true,
      id: (result as any).insertId,
      message: "Request submitted successfully",
    })
  } catch (error) {
    console.error("Create request error:", error)
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 })
  }
}
