import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Booking from "@/models/Booking"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const recentBookings = await Booking.find({}).populate("agent", "name").sort({ createdAt: -1 }).limit(5)

    const formattedBookings = recentBookings.map((booking) => ({
      id: booking._id.toString(),
      customer: booking.customer.name,
      destination: booking.destination,
      date: new Date(booking.departureDate).toISOString().split("T")[0],
      amount: `$${booking.ticketAmount.toFixed(2)}`,
      profit: `$${booking.profitAmount.toFixed(2)}`,
      agent: booking.agent.name,
      status: booking.status,
    }))

    return NextResponse.json(formattedBookings)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch recent bookings" }, { status: 500 })
  }
}
