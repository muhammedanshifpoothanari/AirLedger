"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
  bookingNumber: z.string().optional(),
  customerName: z.string().min(2, {
    message: "Customer name must be at least 2 characters.",
  }),
  customerEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  customerPhone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  departurePlace: z.string().min(2, {
    message: "Departure place must be at least 2 characters.",
  }),
  destination: z.string().min(2, {
    message: "Destination must be at least 2 characters.",
  }),
  departureDate: z.date({
    required_error: "Please select a departure date.",
  }),
  returnDate: z.date().optional(),
  ticketAmount: z.string().min(1, {
    message: "Please enter the ticket amount.",
  }),
  commissionAmount: z.string().min(1, {
    message: "Please enter the commission amount.",
  }),
  agent: z.string({
    required_error: "Please select an agent.",
  }),
  status: z.string({
    required_error: "Please select a status.",
  }),
  paymentStatus: z.string({
    required_error: "Please select a payment status.",
  }),
  notes: z.string().optional(),
})

interface BookingFormProps {
  bookingId?: string
}

interface Agent {
  _id: string
  name: string
}

export function BookingForm({ bookingId }: BookingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoadingData, setIsLoadingData] = useState(bookingId ? true : false)
  const [activeTab, setActiveTab] = useState("details")
  const [creditError, setCreditError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookingNumber: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      departurePlace: "",
      destination: "",
      departureDate: new Date(),
      returnDate: undefined,
      ticketAmount: "",
      commissionAmount: "",
      agent: "",
      status: "",
      paymentStatus: "Unpaid",
      notes: "",
    },
  })

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/agents")
        if (!response.ok) throw new Error("Failed to fetch agents")
        const data = await response.json()
        setAgents(data)
      } catch (error) {
        console.error("Error fetching agents:", error)
        toast({
          title: "Error",
          description: "Failed to load agents. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchAgents()

    if (bookingId) {
      fetchBooking(bookingId)
    } else {
      // Generate a booking number for new entries
      const timestamp = Date.now().toString().slice(-6)
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")
      const year = new Date().getFullYear()
      const bookingNumber = `BK${year}${timestamp}${random}`
      form.setValue("bookingNumber", bookingNumber)
    }
  }, [bookingId, form])

  const fetchBooking = async (id: string) => {
    setIsLoadingData(true)
    try {
      const response = await fetch(`/api/bookings/${id}`)
      if (!response.ok) throw new Error("Failed to fetch booking")

      const booking = await response.json()

      form.reset({
        bookingNumber: booking.bookingNumber || "",
        customerName: booking.customer.name,
        customerEmail: booking.customer.email,
        customerPhone: booking.customer.phone,
        departurePlace: booking.departurePlace || "",
        destination: booking.destination,
        departureDate: new Date(booking.departureDate),
        returnDate: booking.returnDate ? new Date(booking.returnDate) : undefined,
        ticketAmount: booking.ticketAmount.toString(),
        commissionAmount: booking.commissionAmount.toString(),
        agent: booking.agent._id || booking.agent,
        status: booking.status,
        paymentStatus: booking.paymentStatus || "Unpaid",
        notes: booking.notes || "",
      })
    } catch (error) {
      console.error("Error fetching booking:", error)
      toast({
        title: "Error",
        description: "Failed to load booking details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  const checkCreditAvailability = async (amount: number): Promise<boolean> => {
    try {
      const response = await fetch("/api/credit/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      })

      if (!response.ok) {
        throw new Error("Failed to check credit availability")
      }

      const data = await response.json()

      if (!data.available) {
        setCreditError(data.message)
        return false
      }

      setCreditError(null)
      return true
    } catch (error) {
      console.error("Error checking credit:", error)
      setCreditError("Failed to check credit availability. Please try again.")
      return false
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Check if there's enough credit available
      const commissionAmount = Number.parseFloat(values.commissionAmount)
      const hasSufficientCredit = await checkCreditAvailability(commissionAmount)

      if (!hasSufficientCredit) {
        setIsLoading(false)
        return
      }

      // Rest of your existing code...
      const bookingData = {
        bookingNumber: values.bookingNumber,
        customer: {
          name: values.customerName,
          email: values.customerEmail,
          phone: values.customerPhone,
        },
        departurePlace: values.departurePlace,
        destination: values.destination,
        departureDate: values.departureDate.toISOString(),
        returnDate: values.returnDate ? values.returnDate.toISOString() : null,
        ticketAmount: Number.parseFloat(values.ticketAmount),
        commissionAmount: commissionAmount,
        agent: values.agent,
        status: values.status,
        paymentStatus: values.paymentStatus,
        notes: values.notes,
      }

      const url = bookingId ? `/api/bookings/${bookingId}` : "/api/bookings"
      const method = bookingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        throw new Error("Failed to save booking")
      }

      toast({
        title: bookingId ? "Ledger entry updated" : "Ledger entry created",
        description: bookingId ? "The entry has been updated successfully." : "A new ledger entry has been created.",
      })

      router.push("/dashboard/bookings")
      router.refresh()
    } catch (error) {
      console.error("Error saving booking:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }




  
  if (isLoadingData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                  <div className="h-10 w-full animate-pulse rounded bg-muted"></div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{bookingId ? "Edit Ledger Entry" : "New Ledger Entry"}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Transaction Details</TabsTrigger>
            <TabsTrigger value="financial">Financial Information</TabsTrigger>
          </TabsList>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-4">
              <TabsContent value="details">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="bookingNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference Number</FormLabel>
                        <FormControl>
                          <Input placeholder="BK20240001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="departurePlace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departure Place</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination</FormLabel>
                        <FormControl>
                          <Input placeholder="London" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="departureDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Departure Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              disabled={false}
                              captionLayout="dropdown-buttons"
                              fromYear={2000}
                              toYear={2050}
                              classNames={{
                                caption_dropdowns: "flex justify-center gap-1",
                                dropdown: "cursor-pointer rounded-md bg-background p-1 text-sm font-medium",
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="returnDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Return Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              disabled={false}
                              captionLayout="dropdown-buttons"
                              fromYear={2000}
                              toYear={2050}
                              classNames={{
                                caption_dropdowns: "flex justify-center gap-1",
                                dropdown: "cursor-pointer rounded-md bg-background p-1 text-sm font-medium",
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              <TabsContent value="financial">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="ticketAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Debit Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="450" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="commissionAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credit Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="45" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="agent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an agent" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {agents.map((agent) => (
                              <SelectItem key={agent._id} value={agent._id}>
                                {agent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Booking Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Confirmed">Confirmed</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Partial">Partial</SelectItem>
                            <SelectItem value="Unpaid">Unpaid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="mt-6">
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional notes here"
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              {creditError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Credit Error</AlertTitle>
                  <AlertDescription>{creditError}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/bookings")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <span>Saving...</span> : bookingId ? "Update Entry" : "Create Entry"}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  )
}
