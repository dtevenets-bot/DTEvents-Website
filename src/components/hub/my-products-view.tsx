"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { type UserProduct, type Product } from "@/types"
import { useSession } from "next-auth/react"
import { PackageOpen, Check, Gift, ShoppingCart } from "lucide-react"

const mockUserProducts: (UserProduct & Partial<Product>)[] = []

export function MyProductsView() {
  const { data: session } = useSession()
  const discordId = (session?.user as any)?.discordId

  const { data: userProducts, isLoading } = useQuery({
    queryKey: ["user-products", discordId],
    queryFn: async () => {
      if (!discordId) return []
      try {
        const res = await fetch(`/api/user/products?discordId=${discordId}`)
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      } catch {
        return mockUserProducts
      }
    },
    enabled: !!discordId,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border overflow-hidden">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!userProducts || userProducts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <PackageOpen className="h-16 w-16 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No products yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          You don&apos;t own any products yet. Browse the product catalog to find something you like!
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Products</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {userProducts.length} product{userProducts.length !== 1 ? "s" : ""} owned
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {userProducts.map((up: any, index: number) => (
          <motion.div
            key={up.productId ?? index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative overflow-hidden rounded-lg border border-border bg-card"
          >
            {up.images?.front && (
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={up.images.front}
                  alt={up.name ?? "Product"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-foreground text-background border-0 px-2.5 py-1 text-xs font-semibold gap-1">
                    <Check className="h-3 w-3" />
                    Owned
                  </Badge>
                </div>
              </div>
            )}
            <div className="p-4">
              <h3 className="text-base font-semibold mb-1 truncate">{up.name ?? "Unknown Product"}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 gap-1"
                >
                  {up.source === "admin_grant" ? (
                    <>
                      <Gift className="h-2.5 w-2.5" />
                      Granted
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-2.5 w-2.5" />
                      Purchased
                    </>
                  )}
                </Badge>
                {up.grantedAt && (
                  <span>
                    {new Date(up.grantedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
