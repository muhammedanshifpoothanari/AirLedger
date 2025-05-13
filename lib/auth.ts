import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        await connectToDatabase()
        console.log(process.env.Email);

        // For demo purposes, use hardcoded credentials
        if (credentials.email === process.env.Email && credentials.password === process.env.Password) {
          return {
            id: "demo-user",
            name: "Admin User",
            email: "admin@example.com",
            role: "admin",
          }
        }

        // Find user in the database
        const user = await User.findOne({ email: credentials.email })
        if (!user) {
          return null
        }

        // Check if password matches
        const isPasswordValid = await user.comparePassword(credentials.password)
        if (!isPasswordValid) {
          return null
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.role = token.role as string
      }

      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      return token
    },
  },
}
