"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, DollarSign, PlaneTakeoff, TrendingUp } from "lucide-react"

export function BookingStats() {
  const [stats, setStats] = useState([
    {
      title: "Total Sales",
      value: "$0",
      change: "0%",
      icon: DollarSign,
    },
    {
      title: "Total Profit",
      value: "$0",
      change: "0%",
      icon: TrendingUp,
    },
    {
      title: "Bookings",
      value: "0",
      change: "0%",
      icon: PlaneTakeoff,
    },
    {
      title: "Conversion",
      value: "0%",
      change: "0%",
      icon: BarChart3,
    },
  ])

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats")
        if (!response.ok) throw new Error("Failed to fetch stats")

        const data = await response.json()
        setStats(
          data.map((stat: any, index: number) => ({
            ...stat,
            icon: stats[index].icon,
          })),
        )
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.title} className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-6 w-20 animate-pulse rounded bg-muted"></div>
                <div className="h-4 w-28 animate-pulse rounded bg-muted"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change} from last month</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  )
}
