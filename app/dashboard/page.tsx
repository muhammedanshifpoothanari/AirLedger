import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { BookingStats } from "@/components/dashboard/booking-stats"
import { BookingChart } from "@/components/dashboard/booking-chart"
import { RecentBookings } from "@/components/dashboard/recent-bookings"
import { ComparisonStats } from "@/components/dashboard/comparison-stats"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Overview of your air ticket booking business" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <BookingStats />
      </div>
    
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-4 mb-4">
        <BookingChart className="lg:col-span-4" />
        <ComparisonStats className="lg:col-span-3" />
      </div>
      <RecentBookings />
    </DashboardShell>
  )
}
