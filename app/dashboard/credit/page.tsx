import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CreditForm } from "@/components/credit/credit-form"

export default function CreditPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Credit Management" text="Set and manage the available credit limit" />
      <CreditForm />
    </DashboardShell>
  )
}
