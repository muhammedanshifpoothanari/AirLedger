/**
 * Converts an array of objects to CSV format
 */
export function objectsToCSV(data: any[], includeHeaders = true): string {
    if (data.length === 0) return ""
  
    // Get all unique keys from all objects
    const allKeys = new Set<string>()
    data.forEach((item) => {
      Object.keys(item).forEach((key) => allKeys.add(key))
    })
  
    const headers = Array.from(allKeys)
  
    // Create CSV rows
    const rows = data.map((item) => {
      return headers
        .map((key) => {
          const value = item[key]
  
          // Handle nested objects
          if (value && typeof value === "object" && !Array.isArray(value)) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`
          }
  
          // Handle arrays
          if (Array.isArray(value)) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`
          }
  
          // Handle null or undefined
          if (value === null || value === undefined) {
            return ""
          }
  
          // Handle strings with commas, quotes, or newlines
          if (typeof value === "string") {
            if (value.includes(",") || value.includes('"') || value.includes("\n")) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          }
  
          // Handle dates
          if (value instanceof Date) {
            return value.toISOString()
          }
  
          // Everything else
          return String(value)
        })
        .join(",")
    })
  
    // Add headers if requested
    if (includeHeaders) {
      rows.unshift(headers.join(","))
    }
  
    return rows.join("\n")
  }
  
  /**
   * Flattens a nested object for CSV export
   */
  export function flattenObject(obj: any, prefix = ""): any {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? `${prefix}.` : ""
      if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k]) && !(obj[k] instanceof Date)) {
        Object.assign(acc, flattenObject(obj[k], pre + k))
      } else {
        acc[pre + k] = obj[k]
      }
      return acc
    }, {})
  }
  
  /**
   * Formats a booking object for CSV export
   */
  export function formatBookingForExport(booking: any): any {
    return {
      Reference: booking.bookingNumber || "",
      Date: new Date(booking.createdAt).toLocaleDateString(),
      Customer: booking.customer?.name || "",
      Email: booking.customer?.email || "",
      Phone: booking.customer?.phone || "",
      Departure: booking.departurePlace || "",
      Destination: booking.destination || "",
      "Departure Date": new Date(booking.departureDate).toLocaleDateString(),
      "Return Date": booking.returnDate ? new Date(booking.returnDate).toLocaleDateString() : "",
      Debit: booking.ticketAmount.toFixed(2),
      Credit: booking.commissionAmount.toFixed(2),
      Balance: (booking.ticketAmount - booking.commissionAmount).toFixed(2),
      Agent: typeof booking.agent === "object" ? booking.agent.name : "Unknown",
      Status: booking.status || "",
      "Payment Status": booking.paymentStatus || "Unpaid",
      Notes: booking.notes || "",
    }
  }
  
  /**
   * Downloads data as a CSV file
   */
  export function downloadCSV(data: string, filename: string): void {
    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  