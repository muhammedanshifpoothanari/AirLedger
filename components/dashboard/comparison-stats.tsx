"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

interface ComparisonStatsProps {
  className?: string
}

export function ComparisonStats({ className }: ComparisonStatsProps) {
  const [metric, setMetric] = useState("sales")
  const [comparisons, setComparisons] = useState([
    {
      title: "Sales vs Yesterday",
      current: "$0",
      previous: "$0",
      change: 0,
    },
    {
      title: "Sales vs Last Week",
      current: "$0",
      previous: "$0",
      change: 0,
    },
    {
      title: "Sales vs Last Month",
      current: "$0",
      previous: "$0",
      change: 0,
    },
  ])

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchComparisons = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/dashboard/comparison?metric=${metric}`)
        if (!response.ok) throw new Error("Failed to fetch comparison data")

        const data = await response.json()
        setComparisons(data)
      } catch (error) {
        console.error("Error fetching comparison data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComparisons()
  }, [metric])

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Performance Comparison</CardTitle>
          <CardDescription>Compare with previous periods</CardDescription>
        </div>
        <Select value={metric} onValueChange={setMetric}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="profit">Profit</SelectItem>
            <SelectItem value="bookings">Bookings</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {isLoading
            ? Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                      <div className="h-3 w-40 animate-pulse rounded bg-muted"></div>
                    </div>
                    <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                  </div>
                ))
            : comparisons.map((item) => (
                <div key={item.title} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.current} vs {item.previous}
                    </p>
                  </div>
                  <div className={`flex items-center ${item.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {item.change >= 0 ? (
                      <ArrowUpIcon className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="mr-1 h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">{Math.abs(item.change).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  )
}
