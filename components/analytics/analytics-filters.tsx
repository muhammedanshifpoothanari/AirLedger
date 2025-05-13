"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

interface Agent {
  _id: string
  name: string
}

export function AnalyticsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [metric, setMetric] = useState(searchParams.get("metric") || "sales")
  const [agent, setAgent] = useState(searchParams.get("agent") || "all")
  const [destination, setDestination] = useState(searchParams.get("destination") || "all")
  const [comparison, setComparison] = useState(searchParams.get("comparison") || "previous")

  const [agents, setAgents] = useState<Agent[]>([])
  const [destinations, setDestinations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        // Fetch agents
        const agentsResponse = await fetch("/api/agents")
        if (agentsResponse.ok) {
          const agentsData = await agentsResponse.json()
          setAgents(agentsData)
        }

        // Fetch destinations
        const destinationsResponse = await fetch("/api/analytics/destinations")
        if (destinationsResponse.ok) {
          const destinationsData = await destinationsResponse.json()
          const uniqueDestinations = [...new Set(destinationsData.map((item: any) => item.name))]
          setDestinations(uniqueDestinations)
        }
      } catch (error) {
        console.error("Error fetching filters data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFiltersData()
  }, [])

  const handleApplyFilters = () => {
    // Create a new URLSearchParams object
    const params = new URLSearchParams()

    // Add filter parameters
    if (metric) params.set("metric", metric)
    if (agent) params.set("agent", agent)
    if (destination) params.set("destination", destination)
    if (comparison) params.set("comparison", comparison)

    // Update the URL with the filter parameters
    router.push(`/dashboard/analytics?${params.toString()}`)
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Metric</label>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger>
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="profit">Profit</SelectItem>
                <SelectItem value="bookings">Bookings</SelectItem>
                <SelectItem value="commission">Commission</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Agent</label>
            <Select value={agent} onValueChange={setAgent}>
              <SelectTrigger>
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {!isLoading &&
                  agents.map((agent) => (
                    <SelectItem key={agent._id} value={agent._id}>
                      {agent.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Destination</label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Destinations</SelectItem>
                {!isLoading &&
                  destinations.map((dest) => (
                    <SelectItem key={dest} value={dest}>
                      {dest}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Comparison</label>
            <Select value={comparison} onValueChange={setComparison}>
              <SelectTrigger>
                <SelectValue placeholder="Select comparison" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="previous">Previous Period</SelectItem>
                <SelectItem value="year">Year over Year</SelectItem>
                <SelectItem value="target">Target</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

