"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface BookingChartProps {
  className?: string
}

export function BookingChart({ className }: BookingChartProps) {
  const [activeTab, setActiveTab] = useState("daily")
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/dashboard/chart?period=${activeTab}`)
        if (!response.ok) throw new Error("Failed to fetch chart data")

        const data = await response.json()
        setChartData(data)
      } catch (error) {
        console.error("Error fetching chart data:", error)
        // Set fallback data
        setChartData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchChartData()
  }, [activeTab])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>View your sales and profit trends</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-0 sm:px-6">
        <Tabs defaultValue="daily" onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          {isLoading ? (
            <div className="h-[300px] w-full animate-pulse rounded bg-muted"></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Sales" />
                <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
