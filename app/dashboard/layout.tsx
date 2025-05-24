import type React from "react"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { getCurrentUser } from "@/lib/session"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen ">
        <Sidebar variant="inset" collapsible="icon">
          
          <SidebarContent>
            <DashboardNav user={user} />
          </SidebarContent>
        </Sidebar>

          <div className="container mx-auto flex-1 space-y-6 p-6 md:p-8 pt-6">{children}</div>
          
      </div>
      
    </SidebarProvider>
  )
}
