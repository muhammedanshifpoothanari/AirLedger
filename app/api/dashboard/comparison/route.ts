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
    const metric = searchParams.get("metric") || "sales"

    await connectToDatabase()

    // Get current date
    const currentDate = new Date()

    // Yesterday comparison
    const yesterday = new Date(currentDate)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
    const yesterdayEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1)

    const todayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())

    const yesterdayBookings = await Booking.find({
      createdAt: { $gte: yesterdayStart, $lt: yesterdayEnd },
    })

    const todayBookings = await Booking.find({
      createdAt: { $gte: todayStart },
    })

    // Last week comparison
    const lastWeekStart = new Date(currentDate)
    lastWeekStart.setDate(currentDate.getDate() - 7)
    const thisWeekStart = new Date(currentDate)
    thisWeekStart.setDate(currentDate.getDate() - currentDate.getDay())

    const lastWeekBookings = await Booking.find({
      createdAt: { $gte: lastWeekStart, $lt: thisWeekStart },
    })

    const thisWeekBookings = await Booking.find({
      createdAt: { $gte: thisWeekStart },
    })

    // Last month comparison
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
    const thisMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

    const lastMonthBookings = await Booking.find({
      createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
    })

    const thisMonthBookings = await Booking.find({
      createdAt: { $gte: thisMonthStart },
    })

    // Calculate values based on selected metric
    const calculateValue = (bookings: any[]) => {
      if (metric === "sales") {
        return bookings.reduce((sum, booking) => sum + booking.ticketAmount, 0)
      } else if (metric === "profit") {
        return bookings.reduce((sum, booking) => sum + booking.profitAmount, 0)
      } else {
        return bookings.length
      }
    }

    const yesterdayValue = calculateValue(yesterdayBookings)
    const todayValue = calculateValue(todayBookings)
    const lastWeekValue = calculateValue(lastWeekBookings)
    const thisWeekValue = calculateValue(thisWeekBookings)
    const lastMonthValue = calculateValue(lastMonthBookings)
    const thisMonthValue = calculateValue(thisMonthBookings)

    // Calculate percentage changes
    const yesterdayChange = yesterdayValue === 0 ? 100 : ((todayValue - yesterdayValue) / yesterdayValue) * 100
    const weeklyChange = lastWeekValue === 0 ? 100 : ((thisWeekValue - lastWeekValue) / lastWeekValue) * 100
    const monthlyChange = lastMonthValue === 0 ? 100 : ((thisMonthValue - lastMonthValue) / lastMonthValue) * 100

    const prefix = metric === "bookings" ? "" : "$"

    const comparisons = [
      {
        title: `${metric === "sales" ? "Sales" : metric === "profit" ? "Profit" : "Bookings"} vs Yesterday`,
        current: `${prefix}${todayValue.toFixed(metric === "bookings" ? 0 : 2)}`,
        previous: `${prefix}${yesterdayValue.toFixed(metric === "bookings" ? 0 : 2)}`,
        change: yesterdayChange,
      },
      {
        title: `${metric === "sales" ? "Sales" : metric === "profit" ? "Profit" : "Bookings"} vs Last Week`,
        current: `${prefix}${thisWeekValue.toFixed(metric === "bookings" ? 0 : 2)}`,
        previous: `${prefix}${lastWeekValue.toFixed(metric === "bookings" ? 0 : 2)}`,
        change: weeklyChange,
      },
      {
        title: `${metric === "sales" ? "Sales" : metric === "profit" ? "Profit" : "Bookings"} vs Last Month`,
        current: `${prefix}${thisMonthValue.toFixed(metric === "bookings" ? 0 : 2)}`,
        previous: `${prefix}${lastMonthValue.toFixed(metric === "bookings" ? 0 : 2)}`,
        change: monthlyChange,
      },
    ]

    return NextResponse.json(comparisons)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch comparison data" }, { status: 500 })
  }
}
