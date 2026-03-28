"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/hub/product-card"
import { Crown, Sparkles } from "lucide-react"
import { type Product } from "@/types"

const mockBoosterProducts: Product[] = [
  {
    id: "mock4",
    name: "Chauvet COLORado PXL Bar 8",
    description: "Versatile pixel bar with rich colors and smooth mixing. Works with Flux Kit from the box. Budget friendly.",
    price: 150,
    gamepassId: "",
    active: true,
    createdAt: Date.now(),
    createdBy: "",
    tags: ["budget", "flux_kit_ready"],
    type: "wash",
    images: {
      front: "https://cdn.discordapp.com/attachments/1461526163569508452/1461526165251686430/Screenshot_2026-01-03_205840.png?ex=69c485cf&is=69c3344f&hm=702de165d81461980dc2109f312e06be87d0b9ebc69778d75d161e508bdc91d3&",
      back: "https://cdn.discordapp.com/attachments/1461526163569508452/1461526166388211918/Screenshot_2026-01-03_205904.png?ex=69c485cf&is=69c3344f&hm=0e842a6bb9ea78b2b16a466b9a99a8c95524ecadf5848ab81e76b3f9d4847328&",
    },
    maker: "Daniel Tiger",
    boosterExclusive: true,
  },
]

interface BoosterZoneProps {
  onProductClick?: (product: Product) => void
}

export function BoosterZone({ onProductClick }: BoosterZoneProps) {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products", "booster"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/products?boosterOnly=true")
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      } catch {
        return mockBoosterProducts
      }
    },
  })

  const boosterProducts = products?.filter((p) => p.boosterExclusive && p.active) ?? []

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-foreground text-background">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Booster Exclusive Zone</h2>
            <p className="text-sm text-muted-foreground">
              {boosterProducts.length} exclusive product{boosterProducts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="p-4 border border-border rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Thank you for boosting DT Events! These products are exclusively available for server boosters.
            Enjoy access to premium items that aren&apos;t available anywhere else.
          </p>
        </div>
      </motion.div>

      {/* Products */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : boosterProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No booster exclusive products available yet.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boosterProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={onProductClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
