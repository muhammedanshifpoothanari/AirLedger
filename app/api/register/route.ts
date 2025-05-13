import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcrypt"

export async function POST(request: Request) {
  try {
    const { name, email, username, password, role } = await request.json()

    // Validate input
    if (!name || !email || !username || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if user already exists
    const existingUserByEmail = await User.findOne({ email })
    if (existingUserByEmail) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 })
    }

    const existingUserByUsername = await User.findOne({ username })
    if (existingUserByUsername) {
      return NextResponse.json({ message: "Username already in use" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const user = new User({
      name,
      email,
      username,
      password: hashedPassword,
      role: role || "user", // Default to user role if not specified
      isActive: true,
    })

    await user.save()

    // Return success without exposing sensitive data
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json({ message: "Failed to register user" }, { status: 500 })
  }
}
