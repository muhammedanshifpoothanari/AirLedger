import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AgentsTable } from "@/components/agents/agents-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AgentsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Agents" text="Manage your travel agents">
        <Button asChild>
          <Link href="/dashboard/agents/new">Add Agent</Link>
        </Button>
      </DashboardHeader>
      <AgentsTable />
    </DashboardShell>
  )
}
