import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Credit from "@/models/Credit"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    await connectToDatabase()

    // Get the credit info - we'll just use a single record for simplicity
    let credit = await Credit.findOne({})

    // If no credit record exists, create a default one
    if (!credit) {
      credit = new Credit({
        totalAmount: 0,
        usedAmount: 0,
        notes: "Initial credit setup",
      })
      await credit.save()
    }

    return NextResponse.json(credit)
  } catch (error) {
    console.error("Error fetching credit info:", error)
    return NextResponse.json({ error: "Failed to fetch credit information" }, { status: 500 })
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

    // Get the existing credit record or create a new one
    let credit = await Credit.findOne({})

    if (!credit) {
      credit = new Credit({
        totalAmount: data.totalAmount || 0,
        usedAmount: 0,
        notes: data.notes || "Initial credit setup",
      })
    } else {
      // Update the credit record
      credit.totalAmount = data.totalAmount !== undefined ? data.totalAmount : credit.totalAmount
      credit.notes = data.notes || credit.notes

      // Add to history if it's an update
      credit.history.push({
        amount: data.totalAmount - credit.totalAmount,
        type: data.totalAmount > credit.totalAmount ? "increase" : "decrease",
        date: new Date(),
        notes: data.notes || "Credit limit updated",
      })
    }

    credit.lastUpdated = new Date()
    await credit.save()

    return NextResponse.json(credit, { status: 201 })
  } catch (error) {
    console.error("Error updating credit:", error)
    return NextResponse.json({ error: "Failed to update credit" }, { status: 500 })
  }
}
