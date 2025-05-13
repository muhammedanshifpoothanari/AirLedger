import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Booking from "@/models/Booking"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    await connectToDatabase()
    const bookings = await Booking.find({}).populate("agent", "name").sort({ createdAt: -1 })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
console.log('kljnbhgvcf',session);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    await connectToDatabase()

    // Generate a unique booking number
    const bookingCount = await Booking.countDocuments()
    const bookingNumber = `BK${new Date().getFullYear()}${String(bookingCount + 1).padStart(4, "0")}`

    // Calculate profit amount
    const profitAmount = data.commissionAmount || data.ticketAmount * 0.1

    const booking = new Booking({
      bookingNumber,
      customer: data.customer,
      destination: data.destination,
      departureDate: data.departureDate,
      returnDate: data.returnDate,
      ticketAmount: data.ticketAmount,
      commissionAmount: data.commissionAmount,
      profitAmount,
      agent: data.agent,
      status: data.status,
      notes: data.notes,
      user: session.user.id,
    })

    await booking.save()

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
