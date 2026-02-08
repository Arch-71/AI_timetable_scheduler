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

    // Get user ID and role
    const [userRows] = await db.execute("SELECT id, role FROM users WHERE email = ?", [userEmail])
    if (!Array.isArray(userRows) || userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userRows[0] as any
    if (user.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get all faculty requests with faculty details
    const [requests] = await db.execute(`
      SELECT fr.id, fr.faculty_id, fr.type, fr.title, fr.description, fr.status, 
             DATE_FORMAT(fr.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
             u.name as faculty_name, u.email as faculty_email
      FROM faculty_requests fr
      JOIN users u ON fr.faculty_id = u.id
      ORDER BY fr.created_at DESC
    `)

    return NextResponse.json(requests || [])
  } catch (error) {
    console.error("Get admin requests error:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { requestId, status } = await request.json()
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!requestId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
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

    // Get user ID and role
    const [userRows] = await db.execute("SELECT id, role FROM users WHERE email = ?", [userEmail])
    if (!Array.isArray(userRows) || userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userRows[0] as any
    if (user.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Update request status
    await db.execute(
      "UPDATE faculty_requests SET status = ? WHERE id = ?",
      [status, requestId]
    )

    return NextResponse.json({
      success: true,
      message: `Request ${status} successfully`,
    })
  } catch (error) {
    console.error("Update request error:", error)
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}
