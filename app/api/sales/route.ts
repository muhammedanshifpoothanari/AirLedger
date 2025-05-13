import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Booking from "@/models/Booking"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Types } from "mongoose"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const metric = searchParams.get("metric") || "sales"
    const agent = searchParams.get("agent") || "all"
    const destination = searchParams.get("destination") || "all"

    await connectToDatabase()

    // Get current date
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()

    // Create match conditions based on filters
    const matchConditions: any = {}

    if (agent !== "all") {
      matchConditions.agent = new Types.ObjectId(agent)
    }

    if (destination !== "all") {
      matchConditions.destination = destination
    }

    // Aggregate monthly data for the current year
    const monthlyData = await Booking.aggregate([
      {
        $match: {
          ...matchConditions,
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          sales: { $sum: "$ticketAmount" },
          profit: { $sum: "$profitAmount" },
          bookings: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ])

    // Format the data for the chart
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const salesData = months.map((month, index) => {
      const monthData = monthlyData.find((item) => item._id.month === index + 1)
      return {
        name: month,
        sales: monthData ? monthData.sales : 0,
        profit: monthData ? monthData.profit : 0,
        bookings: monthData ? monthData.bookings : 0,
      }
    })

    return NextResponse.json(salesData)
  } catch (error) {
    console.error("Error fetching sales analytics:", error)
    return NextResponse.json({ error: "Failed to fetch sales analytics" }, { status: 500 })
  }
}
