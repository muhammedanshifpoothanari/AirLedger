"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DateRangePicker({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  })

  const [preset, setPreset] = React.useState<string>("custom")

  const handlePresetChange = (value: string) => {
    setPreset(value)

    const today = new Date()

    switch (value) {
      case "today":
        setDate({ from: today, to: today })
        break
      case "yesterday":
        const yesterday = addDays(today, -1)
        setDate({ from: yesterday, to: yesterday })
        break
      case "7days":
        setDate({ from: addDays(today, -7), to: today })
        break
      case "30days":
        setDate({ from: addDays(today, -30), to: today })
        break
      case "thismonth":
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        setDate({ from: firstDayOfMonth, to: lastDayOfMonth })
        break
      case "lastmonth":
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        setDate({ from: firstDayOfLastMonth, to: lastDayOfLastMonth })
        break
      default:
        break
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[260px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex items-center justify-between space-x-2 p-3 border-b">
            <Select value={preset} onValueChange={handlePresetChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="custom">Custom Range</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="thismonth">This Month</SelectItem>
                <SelectItem value="lastmonth">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
