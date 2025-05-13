import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { BookingForm } from "@/components/bookings/booking-form"

export default function EditBookingPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <DashboardHeader heading="Edit Booking" text="Update booking information" />
      <BookingForm bookingId={params.id} />
    </DashboardShell>
  )
}
