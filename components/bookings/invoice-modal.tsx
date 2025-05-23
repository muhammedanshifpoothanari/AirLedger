"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PlaneTakeoff, Download, Printer, Copy, Check } from "lucide-react"
import { format } from "date-fns"

interface InvoiceModalProps {
  booking: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoiceModal({ booking, open, onOpenChange }: InvoiceModalProps) {
  const [copied, setCopied] = useState(false)

  if (!booking) return null

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM dd, yyyy")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const invoiceNumber = `INV-${booking.bookingNumber?.replace("BK", "") || new Date().getTime()}`
  const invoiceDate = format(new Date(), "MMMM dd, yyyy")
  const dueDate = format(new Date(new Date().setDate(new Date().getDate() + 30)), "MMMM dd, yyyy")

  const handlePrint = () => {
    const printContent = document.getElementById("invoice-content")
    const originalContents = document.body.innerHTML

    if (printContent) {
      document.body.innerHTML = printContent.innerHTML
      window.print()
      document.body.innerHTML = originalContents
      window.location.reload()
    }
  }

  const handleDownload = () => {
    const invoiceContent = document.getElementById("invoice-content")
    if (!invoiceContent) return

    const html = invoiceContent.outerHTML
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Invoice-${invoiceNumber}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    const invoiceContent = document.getElementById("invoice-content")
    if (!invoiceContent) return

    const range = document.createRange()
    range.selectNode(invoiceContent)
    window.getSelection()?.removeAllRanges()
    window.getSelection()?.addRange(range)
    document.execCommand("copy")
    window.getSelection()?.removeAllRanges()

    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Invoice</DialogTitle>
          <DialogDescription>Flight booking details for {booking.bookingNumber}</DialogDescription>
        </DialogHeader>

        <div id="invoice-content" className="bg-white p-8 rounded-lg">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <PlaneTakeoff className="h-8 w-8 text-blue-600 mr-2" />
              <div>
                <h1 className="text-2xl font-bold text-blue-600">ShareefLedger</h1>
                <p className="text-sm text-gray-500">Your Trusted Travel Partner</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
              <p className="text-gray-600">#{invoiceNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="text-gray-500 font-medium mb-2">Bill To:</h3>
              <p className="font-bold text-sm text-gray-500">{booking.customer.name}</p>
              <p className="font-bold text-sm text-gray-500">{booking.customer.email}</p>
              <p className="font-bold text-sm text-gray-500"> {booking.customer.phone}</p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className="text-gray-500">Invoice Date:</span>
                <span className="font-medium ml-2 text-sm text-gray-500">{invoiceDate}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-500">Due Date:</span>
                <span className="font-medium ml-2 text-sm text-gray-500">{dueDate}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  {booking.paymentStatus || "Unpaid"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left text-gray-600 font-medium">Description</th>
                  <th className="py-3 px-4 text-right text-gray-600 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-4 px-4">
                    <p className="font-medium">Air Ticket</p>
                    <p className="text-sm text-gray-500">
                      {booking.departurePlace || "destination"} → {booking.destination}
                    </p>
                    <p className="text-sm text-gray-500">
                      Departure: {formatDate(booking.departureDate)}
                      {booking.returnDate && ` | Return: ${formatDate(booking.returnDate)}`}
                    </p>
                    <p className="text-sm text-gray-500">Booking Ref: {booking.bookingNumber}</p>
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-gray-500">
                    {formatCurrency(booking.ticketAmount)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="border-t-2 border-gray-300">
                <tr>
                  <td className="py-4 px-4 text-right font-bold text-gray-500">Total</td>
                  <td className="py-4 px-4 text-right font-bold text-gray-500">
                    {formatCurrency(booking.ticketAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-8 border-t pt-8">
            <h3 className="font-medium mb-2">Payment Information:</h3>
            <p className="text-sm text-gray-600">Please make payment to the following account:</p>
            <div className="mt-2 text-sm">
              <p>
                Bank: <span className="font-medium">Global Bank</span>
              </p>
              <p>
                Account Name: <span className="font-medium">ShareefLedger Inc.</span>
              </p>
              <p>
                Account Number: <span className="font-medium">1234567890</span>
              </p>
              <p>
                SWIFT/BIC: <span className="font-medium">GLBKUS12</span>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Thank you for your business!</p>
            <p>If you have any questions, please contact us at support@ShareefLedger.com</p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleCopy} className="flex items-center">
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" onClick={handlePrint} className="flex items-center">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
