import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AgentForm } from "@/components/agents/agent-form"

export default function EditAgentPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <DashboardHeader heading="Edit Agent" text="Update agent information" />
      <AgentForm agentId={params.id} />
    </DashboardShell>
  )
}
