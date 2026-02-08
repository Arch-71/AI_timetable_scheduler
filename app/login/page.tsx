import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-white text-4xl font-bold mb-2">MCA Timetable Scheduler</h1>
          <p className="text-blue-100">Intelligent Academic Schedule Management</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
