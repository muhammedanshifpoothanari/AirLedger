import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Setting from "@/models/Setting"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // For demo purposes, use a fixed user ID since we're using a demo account
    const userId = session.user.id === "demo-user" ? "demo-user" : session.user.id

    let settings = await Setting.findOne({ user: userId })

    if (!settings) {
      // Create default settings if none exist
      settings = new Setting({
        user: userId,
        companyName: "AirBooker",
        defaultCurrency: "USD",
        defaultCommissionRate: 10,
        emailNotifications: true,
        darkMode: false,
      })
      await settings.save()
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    await connectToDatabase()

    // For demo purposes, use a fixed user ID since we're using a demo account
    const userId = session.user.id === "demo-user" ? "demo-user" : session.user.id

    let settings = await Setting.findOne({ user: userId })

    if (!settings) {
      settings = new Setting({
        user: userId,
        ...data,
      })
    } else {
      // Update all fields
      settings.companyName = data.companyName
      settings.defaultCurrency = data.defaultCurrency
      settings.defaultCommissionRate = data.defaultCommissionRate
      settings.emailNotifications = data.emailNotifications
      settings.darkMode = data.darkMode
      settings.updatedAt = new Date()
    }

    await settings.save()

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
