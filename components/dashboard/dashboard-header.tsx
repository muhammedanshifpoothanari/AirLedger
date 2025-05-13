import type React from "react"
interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
}

export function DashboardHeader({ heading, text, children }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      {children && <div className="flex items-center">{children}</div>}
    </div>
  )
}
