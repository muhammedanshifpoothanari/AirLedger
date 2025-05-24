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

    // Get current date and previous month date
    const currentDate = new Date()
    const previousMonthDate = new Date()
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1)

    // Get total sales, profit, and bookings for current month
    const currentMonthBookings = await Booking.find({
      createdAt: { $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) },
    })

    // Get total sales, profit, and bookings for previous month
    const previousMonthBookings = await Booking.find({
      createdAt: {
        $gte: new Date(previousMonthDate.getFullYear(), previousMonthDate.getMonth(), 1),
        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      },
    })

    // Calculate totals for current month
    const currentMonthSales = currentMonthBookings.reduce((sum, booking) => sum + booking.ticketAmount, 0)
    const currentMonthProfit = currentMonthBookings.reduce((sum, booking) => sum + booking.profitAmount, 0)
    const currentMonthBookingsCount = currentMonthBookings.length

    // Calculate totals for previous month
    const previousMonthSales = previousMonthBookings.reduce((sum, booking) => sum + booking.ticketAmount, 0)
    const previousMonthProfit = previousMonthBookings.reduce((sum, booking) => sum + booking.profitAmount, 0)
    const previousMonthBookingsCount = previousMonthBookings.length

    // Calculate percentage changes
    const salesChange =
      previousMonthSales === 0 ? 100 : ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100
    const profitChange =
      previousMonthProfit === 0 ? 100 : ((currentMonthProfit - previousMonthProfit) / previousMonthProfit) * 100
    const bookingsChange =
      previousMonthBookingsCount === 0
        ? 100
        : ((currentMonthBookingsCount - previousMonthBookingsCount) / previousMonthBookingsCount) * 100

    // Calculate conversion rate (assuming 4 inquiries per booking on average)
    const inquiries = currentMonthBookingsCount * 4
    const conversionRate = inquiries === 0 ? 0 : (currentMonthBookingsCount / inquiries) * 100
    const previousConversionRate = 20 // Placeholder for demo
    const conversionChange = ((conversionRate - previousConversionRate) / previousConversionRate) * 100

    const stats = [
      {
        title: "Total Sales",
        value: `ر.س${currentMonthSales.toFixed(2)}`,
        change: `${salesChange.toFixed(1)}%`,
      },
      {
        title: "Total Profit",
        value: `ر.س${currentMonthProfit.toFixed(2)}`,
        change: `${profitChange.toFixed(1)}%`,
      },
      {
        title: "Bookings",
        value: currentMonthBookingsCount.toString(),
        change: `${bookingsChange.toFixed(1)}%`,
      },
      {
        title: "Conversion",
        value: `${conversionRate.toFixed(0)}%`,
        change: `${conversionChange.toFixed(1)}%`,
      },
    ]

    return NextResponse.json(stats)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
