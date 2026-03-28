"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { type Product } from "@/types"
import { Loader2, Gift, Ban } from "lucide-react"

const mockProducts: Pick<Product, "id" | "name">[] = [
  { id: "mock1", name: "Pioneer DJM V10 Mixer" },
  { id: "mock2", name: "DT 240 Moving Head Beam" },
  { id: "mock3", name: "Shure SLXD2/Nexadyne + SLXD4D" },
  { id: "mock4", name: "Chauvet COLORado PXL Bar 8" },
]

export function AdminPanel() {
  const { toast } = useToast()
  const { data: session } = useSession()

  const { data: products } = useQuery({
    queryKey: ["products-list"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/products")
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      } catch {
        return mockProducts
      }
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin Panel</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Grant or revoke products from users
        </p>
      </div>

      <Tabs defaultValue="grant">
        <TabsList className="bg-muted">
          <TabsTrigger
            value="grant"
            className="data-[state=active]:bg-foreground data-[state=active]:text-background transition-colors"
          >
            <Gift className="h-4 w-4 mr-2" />
            Grant Product
          </TabsTrigger>
          <TabsTrigger
            value="revoke"
            className="data-[state=active]:bg-foreground data-[state=active]:text-background transition-colors"
          >
            <Ban className="h-4 w-4 mr-2" />
            Revoke Product
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grant">
          <GrantProductForm products={products ?? mockProducts} />
        </TabsContent>
        <TabsContent value="revoke">
          <RevokeProductForm products={products ?? mockProducts} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function GrantProductForm({ products }: { products: Pick<Product, "id" | "name">[] }) {
  const { toast } = useToast()
  const [discordId, setDiscordId] = React.useState("")
  const [productId, setProductId] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!discordId || !productId) {
      toast({ title: "Missing fields", description: "Please fill in all required fields." })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDiscordId: discordId, productId, reason: reason || undefined }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Failed to grant product")
      }
      toast({
        title: "Product granted",
        description: `Product has been successfully granted to the user.`,
      })
      setDiscordId("")
      setProductId("")
      setReason("")
    } catch (err: any) {
      toast({
        title: "Failed to grant product",
        description: err.message ?? "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grant Product to User</CardTitle>
        <CardDescription>
          Give a product to a user. They will receive access immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="grant-discord-id">Discord User ID *</Label>
            <Input
              id="grant-discord-id"
              placeholder="Enter the user's Discord ID"
              value={discordId}
              onChange={(e) => setDiscordId(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grant-product-id">Product *</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grant-reason">Reason (optional)</Label>
            <Textarea
              id="grant-reason"
              placeholder="Why is this being granted?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Gift className="h-4 w-4" />
            )}
            Grant Product
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function RevokeProductForm({ products }: { products: Pick<Product, "id" | "name">[] }) {
  const { toast } = useToast()
  const [discordId, setDiscordId] = React.useState("")
  const [productId, setProductId] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!discordId || !productId) {
      toast({ title: "Missing fields", description: "Please fill in all required fields." })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDiscordId: discordId, productId, reason: reason || undefined }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Failed to revoke product")
      }
      toast({
        title: "Product revoked",
        description: `Product has been successfully revoked from the user.`,
      })
      setDiscordId("")
      setProductId("")
      setReason("")
    } catch (err: any) {
      toast({
        title: "Failed to revoke product",
        description: err.message ?? "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revoke Product from User</CardTitle>
        <CardDescription>
          Remove a product from a user. They will lose access immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="revoke-discord-id">Discord User ID *</Label>
            <Input
              id="revoke-discord-id"
              placeholder="Enter the user's Discord ID"
              value={discordId}
              onChange={(e) => setDiscordId(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="revoke-product-id">Product *</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="revoke-reason">Reason (optional)</Label>
            <Textarea
              id="revoke-reason"
              placeholder="Why is this being revoked?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isLoading} variant="outline" className="w-full gap-2 hover:bg-foreground hover:text-background transition-colors">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Ban className="h-4 w-4" />
            )}
            Revoke Product
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
