import { getDb } from "@/lib/db"
import { verifyPassword, hashPassword } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let user
    try {
      user = JSON.parse(Buffer.from(token, "base64").toString())
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json()

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const db = await getDb()

    // Get user's current password hash
    const [rows] = await db.execute("SELECT password FROM users WHERE email = ?", [user.email])
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userRecord = rows[0] as any

    // Verify current password
    const isValid = await verifyPassword(currentPassword, userRecord.password)
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
    }

    // Update password
    const newHash = await hashPassword(newPassword)
    await db.execute("UPDATE users SET password = ? WHERE email = ?", [newHash, user.email])

    // Mark password as changed in students table
    await db.execute("UPDATE students SET password_changed = TRUE WHERE email = ?", [user.email])

    return NextResponse.json({ success: true, message: "Password changed successfully" })
  } catch (error) {
    console.error("[v0] Error changing password:", error)
    return NextResponse.json(
      { error: "Failed to change password", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
