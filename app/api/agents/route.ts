import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Agent from "@/models/Agent"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    await connectToDatabase()
    const agents = await Agent.find({}).sort({ createdAt: -1 })

    return NextResponse.json(agents)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 })
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

    const agent = new Agent(data)
    await agent.save()

    return NextResponse.json(agent, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 })
  }
}
