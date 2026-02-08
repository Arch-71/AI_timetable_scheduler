import { cookies } from "next/headers"

export function setAuthCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set("auth_token", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })
}

export function getAuthCookie() {
  const cookieStore = cookies()
  return cookieStore.get("auth_token")?.value
}

export function deleteAuthCookie() {
  const cookieStore = cookies()
  cookieStore.delete("auth_token")
}
