"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Home, PlaneTakeoff, Plus, Settings, Users } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { UserAccountNav } from "@/components/auth/user-account-nav"

interface DashboardNavProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()

  const routes = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Bookings",
      href: "/dashboard/bookings",
      icon: PlaneTakeoff,
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Agents",
      href: "/dashboard/agents",
      icon: Users,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <>
      <SidebarHeader className="flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <PlaneTakeoff className="h-6 w-6" />
          <span className="font-bold">ShareefLedger</span>
        </Link>
        <Button asChild size="sm" className="h-8">
          <Link href="/dashboard/bookings/new">
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Link>
        </Button>
      </SidebarHeader>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {routes.map((route) => (
              <SidebarMenuItem key={route.href}>
                <SidebarMenuButton asChild isActive={pathname === route.href}>
                  <Link href={route.href}>
                    <route.icon className="h-4 w-4" />
                    <span>{route.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarFooter className="mt-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center space-x-2">
                <UserAccountNav user={user} />
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </>
  )
}
