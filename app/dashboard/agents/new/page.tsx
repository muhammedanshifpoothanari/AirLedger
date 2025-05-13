import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AgentForm } from "@/components/agents/agent-form"

export default function NewAgentPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="New Agent" text="Add a new travel agent" />
      <AgentForm />
    </DashboardShell>
  )
}
