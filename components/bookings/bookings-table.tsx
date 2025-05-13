"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PencilIcon, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

interface Booking {
  _id: string
  customer: {
    name: string
    email: string
    phone: string
  }
  destination: string
  departureDate: string
  ticketAmount: number
  profitAmount: number
  agent: {
    _id: string
    name: string
  }
  status: string
}

export function BookingsTable() {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [data, setData] = useState<Booking[]>([])
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [agents, setAgents] = useState<{ _id: string; name: string }[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string>("all")
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on a mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  useEffect(() => {
    fetchBookings()
    fetchAgents()
  }, [])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/bookings")
      if (!response.ok) throw new Error("Failed to fetch bookings")
      const bookings = await response.json()
      setData(bookings)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "Error",
        description: "Failed to load bookings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents")
      if (!response.ok) throw new Error("Failed to fetch agents")
      const agentsData = await response.json()
      setAgents(agentsData)
    } catch (error) {
      console.error("Error fetching agents:", error)
    }
  }

  const deleteBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete booking")

      setData(data.filter((booking) => booking._id !== id))
      setBookingToDelete(null)

      toast({
        title: "Booking deleted",
        description: "The booking has been deleted successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast({
        title: "Error",
        description: "Failed to delete booking. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "customer.name",
      header: "Customer",
      cell: ({ row }) => <div className="font-medium">{row.original.customer.name}</div>,
    },
    {
      accessorKey: "destination",
      header: "Destination",
    },
    {
      accessorKey: "departureDate",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.departureDate),
    },
    {
      accessorKey: "ticketAmount",
      header: "Amount",
      cell: ({ row }) => <div>${row.original.ticketAmount.toFixed(2)}</div>,
    },
    {
      accessorKey: "profitAmount",
      header: "Profit",
      cell: ({ row }) => <div>${row.original.profitAmount.toFixed(2)}</div>,
    },
    {
      accessorKey: "agent.name",
      header: "Agent",
      filterFn: "equals",
      cell: ({ row }) => <div>{row.original.agent.name}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant={status === "Confirmed" ? "default" : status === "Pending" ? "outline" : "destructive"}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const booking = row.original
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/bookings/${booking._id}`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={() => setBookingToDelete(booking._id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  const handleAgentChange = (value: string) => {
    setSelectedAgent(value)
    if (value === "all") {
      table.getColumn("agent.name")?.setFilterValue("")
    } else {
      table.getColumn("agent.name")?.setFilterValue(value)
    }
  }

  // Mobile card view for each booking
  const MobileBookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{booking.customer.name}</h3>
              <p className="text-sm text-muted-foreground">{booking.destination}</p>
            </div>
            <Badge
              variant={
                booking.status === "Confirmed" ? "default" : booking.status === "Pending" ? "outline" : "destructive"
              }
            >
              {booking.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Date</p>
              <p>{formatDate(booking.departureDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Agent</p>
              <p>{booking.agent.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p>${booking.ticketAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Profit</p>
              <p>${booking.profitAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-0">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/bookings/${booking._id}`}>
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </Button>
        <Button variant="destructive" size="sm" onClick={() => setBookingToDelete(booking._id)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <>
      <Card>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Input
              placeholder="Filter customers..."
              value={(table.getColumn("customer.name")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("customer.name")?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
            <Select value={selectedAgent} onValueChange={handleAgentChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent._id} value={agent.name}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button asChild>
            <Link href="/dashboard/bookings/new">Add Booking</Link>
          </Button>
        </div>

        {/* Desktop view */}
        {!isMobile && (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
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
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Mobile view */}
        {isMobile && (
          <div className="p-4">
            {isLoading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="mb-4">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <div className="h-6 w-32 animate-pulse rounded bg-muted"></div>
                          <div className="h-6 w-20 animate-pulse rounded bg-muted"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {Array(4)
                            .fill(0)
                            .map((_, j) => (
                              <div key={j}>
                                <div className="h-4 w-16 animate-pulse rounded bg-muted mb-1"></div>
                                <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-0">
                      <div className="h-8 w-16 animate-pulse rounded bg-muted"></div>
                      <div className="h-8 w-16 animate-pulse rounded bg-muted"></div>
                    </CardFooter>
                  </Card>
                ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => <MobileBookingCard key={row.id} booking={row.original} />)
            ) : (
              <div className="text-center py-8">No results found.</div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end space-x-2 p-4">
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </Card>

      <AlertDialog open={!!bookingToDelete} onOpenChange={(open) => !open && setBookingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the booking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => bookingToDelete && deleteBooking(bookingToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
