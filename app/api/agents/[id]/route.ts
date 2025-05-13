import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Agent from "@/models/Agent"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const agent = await Agent.findById(params.id)

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json(agent)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch agent" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    await connectToDatabase()

    const agent = await Agent.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true },
    )

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json(agent)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const agent = await Agent.findByIdAndDelete(params.id)

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Agent deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete agent" }, { status: 500 })
  }
}
