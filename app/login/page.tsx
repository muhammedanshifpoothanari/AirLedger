import { LoginForm } from "@/components/auth/login-form"
import { PlaneTakeoff } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100">
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-sky-200 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 h-64 w-64 rounded-full bg-blue-200 opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 h-40 w-40 rounded-full bg-cyan-200 opacity-20 blur-3xl"></div>

        {/* Subtle airplane patterns */}
        <div className="absolute top-1/4 right-1/4 rotate-45 opacity-10">
          <PlaneTakeoff className="h-20 w-20 text-blue-500" />
        </div>
        <div className="absolute bottom-1/4 left-1/4 -rotate-45 opacity-10">
          <PlaneTakeoff className="h-20 w-20 text-blue-500" />
        </div>
      </div>

      {/* Login card with glass effect */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white/80 p-8 shadow-xl backdrop-blur-sm">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex items-center justify-center">
              <PlaneTakeoff className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-blue-600">AirBooker</h1>
            </div>
            <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
          </div>
          <LoginForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-blue-600 underline underline-offset-4">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
