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
    const period = searchParams.get("period") || "daily"

    await connectToDatabase()

    const chartData = []
    const currentDate = new Date()

    if (period === "daily") {
      // Get data for the last 7 days
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 6)

      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)

        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

        const bookings = await Booking.find({
          createdAt: { $gte: dayStart, $lt: dayEnd },
        })

        const sales = bookings.reduce((sum, booking) => sum + booking.ticketAmount, 0)
        const profit = bookings.reduce((sum, booking) => sum + booking.profitAmount, 0)

        chartData.push({
          name: date.toLocaleDateString("en-US", { weekday: "short" }),
          sales,
          profit,
        })
      }
    } else if (period === "weekly") {
      // Get data for the last 4 weeks
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(currentDate)
        weekStart.setDate(currentDate.getDate() - (currentDate.getDay() + 7 * i))

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 7)

        const bookings = await Booking.find({
          createdAt: { $gte: weekStart, $lt: weekEnd },
        })

        const sales = bookings.reduce((sum, booking) => sum + booking.ticketAmount, 0)
        const profit = bookings.reduce((sum, booking) => sum + booking.profitAmount, 0)

        chartData.push({
          name: `Week ${4 - i}`,
          sales,
          profit,
        })
      }

      chartData.reverse()
    } else if (period === "monthly") {
      // Get data for the last 6 months
      for (let i = 0; i < 6; i++) {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0)

        const bookings = await Booking.find({
          createdAt: { $gte: monthStart, $lt: monthEnd },
        })

        const sales = bookings.reduce((sum, booking) => sum + booking.ticketAmount, 0)
        const profit = bookings.reduce((sum, booking) => sum + booking.profitAmount, 0)

        chartData.push({
          name: monthStart.toLocaleDateString("en-US", { month: "short" }),
          sales,
          profit,
        })
      }

      chartData.reverse()
    }

    return NextResponse.json(chartData)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 })
  }
}
