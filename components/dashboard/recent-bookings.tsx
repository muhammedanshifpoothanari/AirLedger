"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PencilIcon } from "lucide-react"
import Link from "next/link"

export function RecentBookings() {
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        const response = await fetch("/api/dashboard/recent-bookings")
        if (!response.ok) throw new Error("Failed to fetch recent bookings")

        const data = await response.json()
        setBookings(data)
      } catch (error) {
        console.error("Error fetching recent bookings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentBookings()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Your most recent ticket bookings</CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/bookings">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      {Array(8)
                        .fill(0)
                        .map((_, j) => (
                          <TableCell key={j}>
                            <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                          </TableCell>
                        ))}
                    </TableRow>
                  ))
              ) : bookings.length > 0 ? (
                bookings.map((booking: any) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.customer}</TableCell>
                    <TableCell>{booking.destination}</TableCell>
                    <TableCell>{booking.date}</TableCell>
                    <TableCell>{booking.amount}</TableCell>
                    <TableCell>{booking.profit}</TableCell>
                    <TableCell>{booking.agent}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.status === "Confirmed"
                            ? "default"
                            : booking.status === "Pending"
                              ? "outline"
                              : "destructive"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/bookings/${booking.id}`}>
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No recent bookings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
