import { hashPassword, verifyPassword, getUserByEmail } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json()
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
    const [rows] = await db.execute("SELECT password FROM users WHERE email = ?", [userEmail])

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = rows[0] as any
    const isValid = await verifyPassword(currentPassword, user.password)

    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    const hashedNewPassword = await hashPassword(newPassword)
    await db.execute("UPDATE users SET password = ? WHERE email = ?", [hashedNewPassword, userEmail])

    return NextResponse.json({ success: true, message: "Password changed successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
