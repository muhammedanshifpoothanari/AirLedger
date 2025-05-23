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
import { PencilIcon, MoreHorizontal, FileText, Download, FileDown } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { InvoiceModal } from "./invoice-modal"
import { objectsToCSV, formatBookingForExport, downloadCSV } from "@/lib/export-utils"

interface Booking {
  _id: string
  bookingNumber?: string
  customer: {
    name: string
    email: string
    phone: string
  }
  destination: string
  departureDate: string
  returnDate?: string
  ticketAmount: number
  commissionAmount: number
  profitAmount: number
  agent:
    | {
        _id: string
        name: string
      }
    | string
  status: string
  paymentStatus?: string
  createdAt: string
  departurePlace?: string
}

export function BookingsTable() {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [data, setData] = useState<Booking[]>([])
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [agents, setAgents] = useState<{ _id: string; name: string }[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isMobile, setIsMobile] = useState(false)
  const [runningBalance, setRunningBalance] = useState<number>(0)
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

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
  }, [sortDirection]) // Add sortDirection as a dependency

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/bookings")
      if (!response.ok) throw new Error("Failed to fetch bookings")
      const bookings = await response.json()

      // Process bookings to ensure consistent data structure
      const processedBookings = bookings.map((booking: any) => ({
        ...booking,
        agent: typeof booking.agent === "object" ? booking.agent : { _id: booking.agent, name: "Unknown" },
        bookingNumber: booking.bookingNumber || `BK-${Math.floor(Math.random() * 10000)}`,
        paymentStatus: booking.paymentStatus || "Unpaid",
      }))

      // Calculate running balance
      let balance = 0
      // Sort by date (oldest first for calculation)
      const sortedForCalculation = [...processedBookings].sort(
        (a: Booking, b: Booking) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )

      // Calculate running balance using proper accounting logic
      sortedForCalculation.forEach((booking: Booking) => {
        balance += booking.ticketAmount - (booking.commissionAmount || 0)
      })
      setRunningBalance(balance)

      // Now sort for display based on user preference
      processedBookings.sort((a: Booking, b: Booking) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortDirection === "desc" ? dateB - dateA : dateA - dateB
      })

      setData(processedBookings)
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

  // Format currency with accounting style (negative numbers in parentheses)
  const formatCurrency = (amount: number) => {
    if (amount < 0) {
      return `($${Math.abs(amount).toFixed(2)})`
    }
    return `$${amount.toFixed(2)}`
  }

  // Calculate running balance for each row
  const calculateRunningBalance = (index: number) => {
    // We need to calculate from the oldest entry to the current one
    // First, get all entries up to and including this one, sorted by date (oldest first)
    const entriesUpToThis = [...data]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, data.length - index)

    // Now calculate the running balance
    let balance = 0
    entriesUpToThis.forEach((booking) => {
      balance += booking.ticketAmount - (booking.commissionAmount || 0)
    })

    return balance
  }

  // Handle generating invoice
  const handleGenerateInvoice = (booking: Booking) => {
    setSelectedBooking(booking)
    setInvoiceOpen(true)
  }

  // Handle exporting a single entry
  const handleExportEntry = (booking: Booking) => {
    const formattedBooking = formatBookingForExport(booking)
    const csv = objectsToCSV([formattedBooking])
    downloadCSV(csv, `Booking_${booking.bookingNumber || booking._id}.csv`)

    toast({
      title: "Entry exported",
      description: "The ledger entry has been exported successfully.",
    })
  }

  // Handle exporting the entire ledger
  const handleExportLedger = () => {
    // Sort by date (oldest first) for the export
    const sortedData = [...data].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    const formattedData = sortedData.map((booking) => formatBookingForExport(booking))
    const csv = objectsToCSV(formattedData)
    downloadCSV(csv, `Booking_Ledger_${new Date().toISOString().split("T")[0]}.csv`)

    toast({
      title: "Ledger exported",
      description: "The ledger has been exported successfully.",
    })
  }

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "bookingNumber",
      header: "Reference",
      cell: ({ row }) => <div className="font-mono text-xs">{row.original.bookingNumber || `BK-${row.index}`}</div>,
    },
    {
      accessorFn: (row) => row.customer.name,
      id: "customerName",
      header: "Description",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.customer.name}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.departurePlace || "Unknown"} → {row.original.destination}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "ticketAmount",
      header: "Debit",
      cell: ({ row }) => <div className="font-mono text-right">{formatCurrency(row.original.ticketAmount)}</div>,
    },
    {
      accessorKey: "commissionAmount",
      header: "Credit",
      cell: ({ row }) => <div className="font-mono text-right">{formatCurrency(row.original.commissionAmount)}</div>,
    },
    {
      id: "balance",
      header: "Balance",
      cell: ({ row }) => {
        const balance = calculateRunningBalance(row.index)
        return (
          <div className={`font-mono font-medium text-right ${balance < 0 ? "text-red-500" : ""}`}>
            {formatCurrency(balance)}
          </div>
        )
      },
    },
    {
      accessorFn: (row) => (typeof row.agent === "object" ? row.agent.name : "Unknown"),
      id: "agentName",
      header: "Agent",
      cell: ({ row }) => (
        <div className="text-sm">{typeof row.original.agent === "object" ? row.original.agent.name : "Unknown"}</div>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => {
        const paymentStatus = row.original.paymentStatus || "Unpaid"
        return (
          <Badge
            variant={paymentStatus === "Paid" ? "default" : paymentStatus === "Partial" ? "outline" : "destructive"}
          >
            {paymentStatus}
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
                <DropdownMenuItem onClick={() => handleGenerateInvoice(booking)}>
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Generate Invoice</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportEntry(booking)}>
                  <div className="flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    <span>Export Entry</span>
                  </div>
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
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  })

  const handleAgentChange = (value: string) => {
    setSelectedAgent(value)
    if (value === "all") {
      table.getColumn("agentName")?.setFilterValue("")
    } else {
      table.getColumn("agentName")?.setFilterValue(value)
    }
  }

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
    if (value === "all") {
      table.getColumn("paymentStatus")?.setFilterValue("")
    } else {
      table.getColumn("paymentStatus")?.setFilterValue(value)
    }
  }

  const toggleSortDirection = () => {
    const newDirection = sortDirection === "desc" ? "asc" : "desc"
    setSortDirection(newDirection)
    setSorting([{ id: "createdAt", desc: newDirection === "desc" }])
  }

  // Mobile card view for each booking - styled as ledger entries
  const MobileBookingCard = ({ booking, index }: { booking: Booking; index: number }) => (
    <Card className="mb-4 border-l-4 border-l-blue-500">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <div className="text-xs text-muted-foreground">
                {formatDate(booking.createdAt)} • Ref: {booking.bookingNumber}
              </div>
              <h3 className="font-medium">{booking.customer.name}</h3>
              <p className="text-xs text-muted-foreground">
                {booking.departurePlace || "Unknown"} → {booking.destination}
              </p>
            </div>
            <Badge
              variant={
                booking.paymentStatus === "Paid"
                  ? "default"
                  : booking.paymentStatus === "Partial"
                    ? "outline"
                    : "destructive"
              }
            >
              {booking.paymentStatus || "Unpaid"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm border-t pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Debit</p>
              <p className="font-mono">{formatCurrency(booking.ticketAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Credit</p>
              <p className="font-mono">{formatCurrency(booking.commissionAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="font-mono font-medium">{formatCurrency(calculateRunningBalance(index))}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Agent</p>
              <p>{typeof booking.agent === "object" ? booking.agent.name : "Unknown"}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-0 pb-3">
        <Button variant="outline" size="sm" onClick={() => handleGenerateInvoice(booking)}>
          <FileText className="h-4 w-4 mr-1" />
          Invoice
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/bookings/${booking._id}`}>
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Booking Ledger</span>
            <div className="text-sm font-normal">
              Total Balance: <span className="font-mono font-bold">{formatCurrency(runningBalance)}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Input
              placeholder="Search ledger..."
              value={(table.getColumn("customerName")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("customerName")?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
            <Select value={selectedAgent} onValueChange={handleAgentChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by agent" />
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
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={toggleSortDirection} className="flex items-center gap-1">
              Date {sortDirection === "desc" ? "↓" : "↑"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportLedger} className="flex items-center">
              <FileDown className="mr-2 h-4 w-4" />
              Export Ledger
            </Button>
            <Button asChild>
              <Link href="/dashboard/bookings/new">Add Entry</Link>
            </Button>
          </div>
        </div>

        {/* Desktop view */}
        {!isMobile && (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-muted/50">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="font-medium">
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
                        {Array(9)
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
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={row.index % 2 === 0 ? "bg-muted/20" : ""}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No entries found in the ledger.
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
              table
                .getRowModel()
                .rows.map((row) => <MobileBookingCard key={row.id} booking={row.original} index={row.index} />)
            ) : (
              <div className="text-center py-8">No entries found in the ledger.</div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length,
            )}{" "}
            of {table.getFilteredRowModel().rows.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <div className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Invoice Modal */}
      {selectedBooking && <InvoiceModal booking={selectedBooking} open={invoiceOpen} onOpenChange={setInvoiceOpen} />}

      <AlertDialog open={!!bookingToDelete} onOpenChange={(open) => !open && setBookingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this ledger entry.
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
