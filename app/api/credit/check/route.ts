import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Credit from "@/models/Credit"

export async function POST(request: Request) {
  try {
    const { amount } = await request.json()

    if (!amount || isNaN(Number(amount))) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    await connectToDatabase()

    // Get the credit info
    const credit = await Credit.findOne({})

    if (!credit) {
      return NextResponse.json({
        available: false,
        message: "No credit has been set up",
      })
    }

    const requestedAmount = Number(amount)
    const availableCredit = credit.totalAmount - credit.usedAmount

    return NextResponse.json({
      available: availableCredit >= requestedAmount,
      availableAmount: availableCredit,
      requestedAmount,
      message:
        availableCredit >= requestedAmount
          ? "Credit available"
          : `Insufficient credit. Available: ${availableCredit}, Requested: ${requestedAmount}`,
    })
  } catch (error) {
    console.error("Error checking credit:", error)
    return NextResponse.json({ error: "Failed to check credit availability" }, { status: 500 })
  }
}




