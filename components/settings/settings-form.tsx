"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  defaultCurrency: z.string({
    required_error: "Please select a default currency.",
  }),
  defaultCommissionRate: z.string().min(1, {
    message: "Please enter a default commission rate.",
  }),
  emailNotifications: z.boolean().default(true),
  darkMode: z.boolean().default(false),
})

export function SettingsForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSeedingDb, setIsSeedingDb] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "AirBooker",
      defaultCurrency: "USD",
      defaultCommissionRate: "10",
      emailNotifications: true,
      darkMode: false,
    },
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const settings = await response.json()
          console.log("Loaded settings:", settings) // Debug log
          form.reset({
            companyName: settings.companyName || "AirBooker",
            defaultCurrency: settings.defaultCurrency || "USD",
            defaultCommissionRate: settings.defaultCommissionRate?.toString() || "10",
            emailNotifications: settings.emailNotifications !== undefined ? settings.emailNotifications : true,
            darkMode: settings.darkMode !== undefined ? settings.darkMode : false,
          })
        } else {
          console.error("Failed to load settings:", await response.text())
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings. Using default values.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchSettings()
  }, [form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    console.log("Submitting settings:", values) // Debug log

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName: values.companyName,
          defaultCurrency: values.defaultCurrency,
          defaultCommissionRate: Number.parseFloat(values.defaultCommissionRate),
          emailNotifications: values.emailNotifications,
          darkMode: values.darkMode,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Failed to update settings:", errorText)
        throw new Error("Failed to update settings")
      }

      const updatedSettings = await response.json()
      console.log("Settings updated:", updatedSettings) // Debug log

      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully.",
      })

      // Refresh the page to apply settings
      router.refresh()
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const seedDatabase = async () => {
    setIsSeedingDb(true)
    try {
      const response = await fetch("/api/seed", {
        method: "POST",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Failed to seed database:", errorText)
        throw new Error("Failed to seed database")
      }

      const result = await response.json()
      console.log("Database seeded:", result) // Debug log

      toast({
        title: "Database seeded",
        description: `Successfully created ${result.counts.users} users, ${result.counts.agents} agents, and ${result.counts.bookings} bookings.`,
      })

      // Refresh the page to show new data
      router.refresh()
    } catch (error) {
      console.error("Error seeding database:", error)
      toast({
        title: "Error",
        description: "Failed to seed database. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSeedingDb(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
              <div className="h-10 w-full animate-pulse rounded bg-muted"></div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your company name" {...field} />
                </FormControl>
                <FormDescription>This will be displayed throughout the application.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="defaultCurrency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Currency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>The default currency for all transactions.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="defaultCommissionRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Commission Rate (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} />
                </FormControl>
                <FormDescription>The default commission rate for new bookings.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emailNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Email Notifications</FormLabel>
                  <FormDescription>Receive email notifications for new bookings and updates.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="darkMode"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Dark Mode</FormLabel>
                  <FormDescription>Enable dark mode for the application.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </Form>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Database Management</CardTitle>
          <CardDescription>Seed your database with sample data for testing</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This will reset your database and populate it with sample data. All existing data will be lost.
            </AlertDescription>
          </Alert>
          <Button variant="outline" className="flex items-center gap-2" onClick={seedDatabase} disabled={isSeedingDb}>
            <Database className="h-4 w-4" />
            {isSeedingDb ? "Seeding Database..." : "Seed Database"}
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
