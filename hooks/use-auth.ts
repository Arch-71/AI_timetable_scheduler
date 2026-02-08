"use client"

import { useState, useCallback, useEffect } from "react"

export interface User {
  id: number
  email: string
  name: string
  short_name?: string
  role: "admin" | "faculty" | "student"
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user from cookie on mount
  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem("auth_token")
      if (token) {
        try {
          setUser(JSON.parse(atob(token)))
        } catch (e) {
          localStorage.removeItem("auth_token")
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, isSignUp: false }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Login failed")
      }

      const { user: userData, token } = await response.json()
      localStorage.setItem("auth_token", token)
      setUser(userData)
      return userData
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(async (email: string, password: string, name: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, isSignUp: true }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Sign up failed")
      }

      const { user: userData, token } = await response.json()
      localStorage.setItem("auth_token", token)
      setUser(userData)
      return userData
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token")
    setUser(null)
    setError(null)
  }, [])

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  }
}
