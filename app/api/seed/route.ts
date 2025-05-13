import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import Agent from "@/models/Agent"
import Booking from "@/models/Booking"
import Setting from "@/models/Setting"
import bcrypt from "bcrypt"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    // Only allow in development mode or for admin users
    if (process.env.NODE_ENV !== "development" && (!session || session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Clear existing data
    await User.deleteMany({})
    await Agent.deleteMany({})
    await Booking.deleteMany({})
    await Setting.deleteMany({})

    // Create admin user
    const passwordHash = await bcrypt.hash("password", 10)
    const adminUser = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: passwordHash,
      role: "admin",
      isActive: true,
    })

    await adminUser.save()

    // Create agents
    const agents = [
      {
        name: "Akbar Travels",
        email: "contact@akbartravels.com",
        phone: "+91 1234567890",
        address: "123 Main St, Mumbai, India",
        commissionRate: 10,
      },
      {
        name: "Thomas Cook",
        email: "info@thomascook.com",
        phone: "+44 9876543210",
        address: "456 High St, London, UK",
        commissionRate: 12,
      },
      {
        name: "MakeMyTrip",
        email: "support@makemytrip.com",
        phone: "+91 5432167890",
        address: "789 Tech Park, Bangalore, India",
        commissionRate: 8,
      },
    ]

    const createdAgents = await Agent.insertMany(agents)

    // Create bookings
    const destinations = [
      "New York",
      "London",
      "Dubai",
      "Singapore",
      "Paris",
      "Tokyo",
      "Sydney",
      "Rome",
      "Bangkok",
      "Amsterdam",
    ]

    const customers = [
      { name: "John Doe", email: "john@example.com", phone: "1234567890" },
      { name: "Jane Smith", email: "jane@example.com", phone: "2345678901" },
      { name: "Robert Johnson", email: "robert@example.com", phone: "3456789012" },
      { name: "Emily Davis", email: "emily@example.com", phone: "4567890123" },
      { name: "Michael Wilson", email: "michael@example.com", phone: "5678901234" },
    ]

    const statuses = ["Confirmed", "Pending", "Cancelled"]

    const bookings = []

    // Create bookings for the past 12 months to have good analytics data
    for (let i = 0; i < 60; i++) {
      const ticketAmount = Math.floor(Math.random() * 1000) + 300
      const commissionRate = createdAgents[i % 3].commissionRate
      const commissionAmount = (ticketAmount * commissionRate) / 100

      // Create dates spread across the past 12 months
      const createdAt = new Date()
      createdAt.setMonth(createdAt.getMonth() - Math.floor(Math.random() * 12))
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30))

      const departureDate = new Date(createdAt)
      departureDate.setDate(departureDate.getDate() + Math.floor(Math.random() * 30) + 1)

      const returnDate = new Date(departureDate)
      returnDate.setDate(returnDate.getDate() + Math.floor(Math.random() * 14) + 1)

      const customer = customers[i % customers.length]
      const destination = destinations[i % destinations.length]

      bookings.push({
        bookingNumber: `BK${new Date().getFullYear()}${String(i + 1).padStart(4, "0")}`,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
        agent: createdAgents[i % 3]._id,
        user: adminUser._id,
        destination: destination,
        departureDate,
        returnDate,
        ticketAmount,
        commissionAmount,
        profitAmount: commissionAmount,
        status: statuses[i % 3],
        notes: i % 3 === 0 ? "Business class ticket" : "",
        createdAt,
        updatedAt: createdAt,
      })
    }

    await Booking.insertMany(bookings)

    // Create settings
    const settings = new Setting({
      user: adminUser._id,
      companyName: "AirBooker",
      defaultCurrency: "USD",
      defaultCommissionRate: 10,
      emailNotifications: true,
      darkMode: false,
    })

    await settings.save()

    return NextResponse.json({
      message: "Database seeded successfully",
      counts: {
        users: 1,
        agents: createdAgents.length,
        bookings: bookings.length,
        settings: 1,
      },
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}
