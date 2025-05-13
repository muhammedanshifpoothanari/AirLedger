import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AnalyticsCharts } from "@/components/analytics/analytics-charts"
import { AnalyticsFilters } from "@/components/analytics/analytics-filters"

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Analytics" text="Detailed analysis of your booking data" />
      <AnalyticsFilters />
      <AnalyticsCharts />
    </DashboardShell>
  )
}
