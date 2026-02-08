"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { ForcePasswordChange } from "@/components/force-password-change"

interface LoginFormProps {
  // Login-only form
}

export function LoginForm({}: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [changePasswordEmail, setChangePasswordEmail] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const user = await login(email, password)
      
      // Redirect based on user role.
      // If a user has role 'admin' in DB but they exist in the faculties table,
      // prefer routing them to /faculty (handles cases where DB roles were set incorrectly).
      if (user?.role === "faculty") {
        router.push("/faculty")
      } else if (user?.role === "admin") {
        try {
          const res = await fetch(`/api/faculties?email=${encodeURIComponent(user.email)}`)
          if (res.ok) {
            const rows = await res.json()
            if (Array.isArray(rows) && rows.length > 0) {
              router.push("/faculty")
            } else {
              router.push("/dashboard")
            }
          } else {
            router.push("/dashboard")
          }
        } catch (e) {
          router.push("/dashboard")
        }
      } else if (user?.role === "student") {
        router.push("/student")
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {showChangePassword && (
        <ForcePasswordChange 
          userEmail={changePasswordEmail} 
          onPasswordChanged={() => {
            setShowChangePassword(false)
            setChangePasswordEmail("")
          }}
          onGoBack={() => {
            setShowChangePassword(false)
            setChangePasswordEmail("")
          }}
        />
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xl mx-auto mb-4">
            MCA
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Welcome Back</h1>
          <p className="text-neutral-600">Sign in to manage your timetables</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-dark text-white">
            {loading ? "Processing..." : "Sign In"}
          </Button>
          <Button
            type="button"
            onClick={() => router.push("/")}
            disabled={loading}
            className="w-full mt-3 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
          >
            Back to Home
          </Button>
        </form>

        <div className="mt-6 space-y-4 border-t border-neutral-200 pt-4">
          <p className="text-neutral-600 text-sm">
            Contact your administrator to create an account.
          </p>
          <button
            onClick={() => {
              setShowChangePassword(true)
              setChangePasswordEmail("")
            }}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Need to change your password?
          </button>
        </div>
      </div>
    </div>
  )
}
