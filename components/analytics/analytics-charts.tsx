"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { useSearchParams } from "next/navigation"

export function AnalyticsCharts() {
  const searchParams = useSearchParams()
  const metric = searchParams.get("metric") || "sales"
  const agentFilter = searchParams.get("agent") || "all"
  const destinationFilter = searchParams.get("destination") || "all"

  const [salesData, setSalesData] = useState<any[]>([])
  const [agentData, setAgentData] = useState<any[]>([])
  const [destinationData, setDestinationData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true)
      try {
        // Fetch sales data
        const salesParams = new URLSearchParams({
          metric,
          agent: agentFilter,
          destination: destinationFilter,
        })

        const salesResponse = await fetch(`/api/analytics/sales?${salesParams.toString()}`)
        if (salesResponse.ok) {
          const data = await salesResponse.json()
          console.log('data',data);
          
          setSalesData(data)
        }

        // Fetch agent data
        const agentResponse = await fetch(`/api/analytics/agents?metric=${metric}`)
        if (agentResponse.ok) {
          const data = await agentResponse.json()
          setAgentData(data)
        }

        // Fetch destination data
        const destinationResponse = await fetch(`/api/analytics/destinations?metric=${metric}`)
        if (destinationResponse.ok) {
          const data = await destinationResponse.json()
          setDestinationData(data)
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [metric, agentFilter, destinationFilter])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  // Render loading skeletons if data is loading
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="h-6 w-40 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-60 animate-pulse rounded bg-muted"></div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full animate-pulse rounded bg-muted"></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 w-40 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-60 animate-pulse rounded bg-muted"></div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full animate-pulse rounded bg-muted"></div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="h-6 w-40 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-60 animate-pulse rounded bg-muted"></div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full animate-pulse rounded bg-muted"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Sales & Profit Trends</CardTitle>
          <CardDescription>Monthly sales and profit over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="line">
            <TabsList className="mb-4">
              <TabsTrigger value="line">Line</TabsTrigger>
              <TabsTrigger value="bar">Bar</TabsTrigger>
            </TabsList>
            <TabsContent value="line">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Sales" />
                  <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="bar">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" name="Sales" />
                  <Bar dataKey="profit" fill="#82ca9d" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Bookings by Agent</CardTitle>
          <CardDescription>Distribution of bookings by travel agent</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={agentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {agentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Popular Destinations</CardTitle>
          <CardDescription>Number of bookings by destination</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={destinationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
