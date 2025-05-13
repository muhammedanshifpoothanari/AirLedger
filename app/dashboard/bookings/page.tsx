import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { BookingsTable } from "@/components/bookings/bookings-table"
import { DateRangePicker } from "@/components/date-range-picker"

export default function BookingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Bookings" text="Manage your air ticket bookings">
        <DateRangePicker />
      </DashboardHeader>
      <BookingsTable />
    </DashboardShell>
  )
}
