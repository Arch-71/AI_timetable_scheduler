import crypto from "crypto"
import { getDb } from "./db"

// Development fallback credentials:
// Set DEV_LOGIN=true to enable a simple hardcoded login useful when the DB is not connected.
// Override via DEV_ADMIN_EMAIL and DEV_ADMIN_PASSWORD environment variables.

export interface User {
  id: number
  email: string
  name: string
  short_name?: string
  role: "admin" | "faculty" | "student"
  needsPasswordReset: boolean
}

export async function hashPassword(password: string): Promise<string> {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDb()
  const [rows] = await db.execute(
    `SELECT u.id, u.email, u.name, u.role, 
            f.short_name
     FROM users u
     LEFT JOIN faculties f ON u.email = f.email
     WHERE u.email = ?`,
    [email]
  )

  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0] as User
  }
  return null
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hash = await hashPassword(password)
  return hash === hashedPassword
}

// lib/auth.ts
export async function createUser(
  email: string,
  password: string,
  name: string,
  role: "admin" | "faculty" | "student" = "faculty",
  needsPasswordReset: boolean = true  // Add this parameter
): Promise<User> {
  const db = await getDb()
  const hashedPassword = await hashPassword(password)
  
  try {
    const [result] = await db.execute(
      "INSERT INTO users (email, password, name, role, needs_password_reset) VALUES (?, ?, ?, ?, ?)",
      [email, hashedPassword, name, role, needsPasswordReset]
    )
    
    return {
      id: (result as any).insertId,
      email,
      name,
      role,
      needsPasswordReset
    }
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Email already in use')
    }
    throw error
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  // If DEV_LOGIN is enabled, allow a simple DB-less login for testing/local dev.
  if (process.env.DEV_LOGIN === "true") {
    const devEmail = process.env.DEV_ADMIN_EMAIL ?? "admin@example.com"
    const devPassword = process.env.DEV_ADMIN_PASSWORD ?? "password"

    if (email === devEmail && password === devPassword) {
      return {
        id: 0,
        email: devEmail,
        name: process.env.DEV_ADMIN_NAME ?? "Dev Admin",
        role: "admin",
        needsPasswordReset: false
      }
    }
    // If credentials don't match the dev fallback, continue to DB check below.
  }

  const db = await getDb()
  const [rows] = await db.execute(
    `SELECT u.id, u.email, u.name, u.role, u.password,
            f.short_name
     FROM users u
     LEFT JOIN faculties f ON u.email = f.email
     WHERE u.email = ?`,
    [email]
  )

  if (!Array.isArray(rows) || rows.length === 0) {
    return null
  }

  const user = rows[0] as any
  const isValid = await verifyPassword(password, user.password)

  if (!isValid) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    short_name: user.short_name || undefined,
    role: user.role,
    needsPasswordReset: false
  }
}
