import { authenticateUser, createUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, isSignUp, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    let user

    if (isSignUp) {
      if (!name) {
        return NextResponse.json({ error: "Name is required for sign up" }, { status: 400 })
      }
      user = await createUser(email, password, name)
    } else {
      user = await authenticateUser(email, password)
      if (!user) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
      }
    }

    // Create response with auth cookie
    const response = NextResponse.json({
      success: true,
      user,
      token: Buffer.from(JSON.stringify(user)).toString("base64"),
    })

    response.cookies.set("auth_token", Buffer.from(JSON.stringify(user)).toString("base64"), {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return response
  } catch (error) {
    console.error("[v0] Auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
