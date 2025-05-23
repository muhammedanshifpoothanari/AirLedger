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

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    await connectToDatabase()

    // Generate a unique booking number using timestamp and random component
    const timestamp = Date.now().toString().slice(-6) // Last 6 digits of timestamp
    
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0") // 3-digit random number
    const year = new Date().getFullYear()
    const bookingNumber = `BK${year}${timestamp}${random}`

    // Verify the booking number is unique (just to be extra safe)
    const existingBooking = await Booking.findOne({ bookingNumber })
    console.log(session);

    let bookingNumberTemp = bookingNumber
           if (existingBooking) {
             // In the extremely unlikely case of a collision, add another random component
             const extraRandom = Math.floor(Math.random() * 100)
               .toString()
               .padStart(2, "0")
             bookingNumberTemp = `${bookingNumber}${extraRandom}`
           }

    // Calculate profit amount
    const profitAmount = data.commissionAmount || data.ticketAmount * 0.1

    const booking = new Booking({
      bookingNumber:bookingNumberTemp,
      customer: data.customer,
      departurePlace:data.departurePlace,
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
