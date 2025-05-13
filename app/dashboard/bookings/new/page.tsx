import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { BookingForm } from "@/components/bookings/booking-form"

export default function NewBookingPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="New Booking" text="Add a new air ticket booking" />
      <BookingForm />
    </DashboardShell>
  )
}
