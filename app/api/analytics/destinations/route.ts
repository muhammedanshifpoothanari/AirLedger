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

    // Aggregate bookings by destination
    const destinations = await Booking.aggregate([
      {
        $group: {
          _id: "$destination",
          bookings: { $sum: 1 },
          sales: { $sum: "$ticketAmount" },
          profit: { $sum: "$profitAmount" },
        },
      },
      {
        $sort: { bookings: -1 },
      },
      {
        $limit: 8,
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          bookings: 1,
          sales: 1,
          profit: 1,
        },
      },
    ])

    return NextResponse.json(destinations)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch destination analytics" }, { status: 500 })
  }
}
