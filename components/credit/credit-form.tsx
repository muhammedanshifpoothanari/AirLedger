"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  totalAmount: z
    .string()
    .min(1, {
      message: "Total credit amount is required.",
    })
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Credit amount must be a positive number.",
    }),
  notes: z.string().optional(),
})
const creditSchema = z.object({
  usedAmount: z
    .string()
    .min(1, {
      message: "Total credit amount is required.",
    })
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Credit amount must be a positive number.",
    }),
  notes: z.string().optional(),
})

export function CreditForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [creditInfo, setCreditInfo] = useState<any>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [editTotalAmount, setEditTotalAmount] = useState(false)
  const [editUsedAmount, setEditUsedAmount] = useState(false)
  
  const [totalAmountInput, setTotalAmountInput] = useState("")
  const [usedAmountInput, setUsedAmountInput] = useState("")
  

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalAmount: "0",
      notes: "",
    },
  })

  useEffect(() => {
    fetchCreditInfo()
  }, [])

  

  const fetchCreditInfo = async () => {
    setIsLoadingData(true)
    try {
      const response = await fetch("/api/credit")
      if (!response.ok) throw new Error("Failed to fetch credit information")

      const data = await response.json()
      setCreditInfo(data)

      form.reset({
        totalAmount: data.totalAmount.toString(),
        notes: "",
      })
    } catch (error) {
      console.error("Error fetching credit info:", error)
      toast({
        title: "Error",
        description: "Failed to load credit information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/credit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          totalAmount: Number(values.totalAmount),
          notes: values.notes,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update credit")
      }

      const updatedCredit = await response.json()
      setCreditInfo(updatedCredit)

      toast({
        title: "Credit updated",
        description: "The credit limit has been updated successfully.",
      })

      form.reset({
        totalAmount: updatedCredit.totalAmount.toString(),
        notes: "",
      })
    } catch (error) {
      console.error("Error updating credit:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }


  async function onUpdateTotalAmount() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/credit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalAmount: Number(totalAmountInput),
          notes: "Updated total credit",
        }),
      })
  
      if (!response.ok) throw new Error("Failed to update")
  
      const updated = await response.json()
      setCreditInfo(updated)
      setEditTotalAmount(false)
      toast({ title: "Success", description: "Total credit updated." })
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }
  



  async function onUpdateUsedAmount() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/credit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usedAmount: Number(usedAmountInput),
          notes: "Updated used credit",
        }),
      })
  
      if (!response.ok) throw new Error("Failed to update")
  
      const updated = await response.json()
      setCreditInfo(updated)
      setEditUsedAmount(false)
      toast({ title: "Success", description: "Used credit updated." })
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }
  


  if (isLoadingData) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Management</CardTitle>
        <CardDescription>Set and manage the available credit limit</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Credit <span className="p-3 cursor-pointer" onClick={() => {setEditTotalAmount(true)}}>✍️</span></CardTitle>
            </CardHeader>
            <CardContent>
            {editTotalAmount ? (
  <>
    <input
      type="number"
      value={totalAmountInput}
      onChange={(e) => setTotalAmountInput(e.target.value)}
      className="border p-2"
    />
    <span onClick={onUpdateTotalAmount} className="p-3 cursor-pointer">✅</span>
    <span onClick={() => setEditTotalAmount(false)} className="cursor-pointer">❌</span>
  </>
) : (
  <div className="text-2xl font-bold">${creditInfo?.totalAmount.toFixed(2)}</div>
)}

               
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Used Credit <span className="p-3 cursor-pointer" onClick={() => {setEditUsedAmount(true)}}>✍️</span></CardTitle>
            </CardHeader>
            <CardContent>
            {editUsedAmount ? (
  <>
    <input
      type="number"
      value={usedAmountInput}
      onChange={(e) => setUsedAmountInput(e.target.value)}
      className="border p-2"
    />
    <span onClick={onUpdateUsedAmount} className="p-3 cursor-pointer">✅</span>
    <span onClick={() => setEditUsedAmount(false)} className="cursor-pointer">❌</span>
  </>
) : (
  <div className="text-2xl font-bold">${creditInfo?.usedAmount.toFixed(2)}</div>
)}

            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Credit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(creditInfo?.totalAmount - creditInfo?.usedAmount).toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Credit Amount ($)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Set the total credit limit. Current available credit: $
                    {(creditInfo?.totalAmount - creditInfo?.usedAmount).toFixed(2)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this credit update"
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? "Updating..." : "Update Credit Limit"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t pt-6">
        <h3 className="text-sm font-medium mb-2">Last Updated</h3>
        <p className="text-sm text-muted-foreground">
          {creditInfo?.lastUpdated ? new Date(creditInfo.lastUpdated).toLocaleString() : "Never"}
        </p>
      </CardFooter>
    </Card>
  )
}
