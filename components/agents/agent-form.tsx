"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Agent name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  commissionRate: z.string().min(1, {
    message: "Please enter a commission rate.",
  }),
})

interface AgentFormProps {
  agentId?: string
}

export function AgentForm({ agentId }: AgentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(agentId ? true : false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      commissionRate: "10",
    },
  })

  useEffect(() => {
    if (agentId) {
      fetchAgent(agentId)
    }
  }, [agentId])

  const fetchAgent = async (id: string) => {
    setIsLoadingData(true)
    try {
      const response = await fetch(`/api/agents/${id}`)
      if (!response.ok) throw new Error("Failed to fetch agent")

      const agent = await response.json()

      form.reset({
        name: agent.name,
        email: agent.email,
        phone: agent.phone || "",
        address: agent.address || "",
        commissionRate: agent.commissionRate.toString(),
      })
    } catch (error) {
      console.error("Error fetching agent:", error)
      toast({
        title: "Error",
        description: "Failed to load agent details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const agentData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        commissionRate: Number.parseFloat(values.commissionRate),
      }

      const url = agentId ? `/api/agents/${agentId}` : "/api/agents"
      const method = agentId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agentData),
      })

      if (!response.ok) {
        throw new Error("Failed to save agent")
      }

      toast({
        title: agentId ? "Agent updated" : "Agent created",
        description: agentId ? "The agent has been updated successfully." : "A new agent has been created.",
      })

      router.push("/dashboard/agents")
      router.refresh()
    } catch (error) {
      console.error("Error saving agent:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <Card>
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Akbar Travels" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234 567 8900" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="commissionRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="123 Main St, City, Country"
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/agents")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <span>Saving...</span> : agentId ? "Update Agent" : "Create Agent"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
