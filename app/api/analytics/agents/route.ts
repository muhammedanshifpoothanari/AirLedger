import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Booking from "@/models/Booking"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const metric = searchParams.get("metric") || "bookings"

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
        $limit: 10,
      },
    ])

    // Format the data for the chart
    const destinationData = destinations.map((dest) => {
      // Determine which metric to use
      let value = 0
      switch (metric) {
        case "sales":
          value = dest.sales || 0
          break
        case "profit":
          value = dest.profit || 0
          break
        case "bookings":
        default:
          value = dest.bookings || 0
          break
      }

      return {
        name: dest._id,
        bookings: dest.bookings,
        sales: dest.sales,
        profit: dest.profit,
        value: value,
      }
    })

    return NextResponse.json(destinationData)
  } catch (error) {
    console.error("Error fetching destination analytics:", error)
    return NextResponse.json({ error: "Failed to fetch destination analytics" }, { status: 500 })
  }
}
