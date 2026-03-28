"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Sparkles, Tag, ShoppingCart, Check, Crown, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type Product } from "@/types"
import { useCartStore } from "@/stores/cart-store"

interface ProductCardProps {
  product: Product
  owned?: boolean
  onClick?: (product: Product) => void
  onAddToCart?: (product: Product) => void
}

const tagBadgeMap: Record<string, { icon: React.ElementType; label: string; variant: "default" | "secondary" | "outline" }> = {
  new: { icon: Sparkles, label: "NEW", variant: "default" },
  budget: { icon: Tag, label: "BUDGET", variant: "secondary" },
  free: { icon: Tag, label: "FREE", variant: "secondary" },
  flux_kit_ready: { icon: Zap, label: "FLUX KIT", variant: "outline" },
}

export function ProductCard({ product, owned = false, onClick, onAddToCart }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const [imageLoaded, setImageLoaded] = React.useState(false)
  const [backImageLoaded, setBackImageLoaded] = React.useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAddToCart) {
      onAddToCart(product)
    } else {
      addItem(product)
    }
  }

  const tagBadges = product.tags
    .map((tag) => tagBadgeMap[tag])
    .filter(Boolean)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-lg border border-border bg-card cursor-pointer"
      onClick={() => onClick?.(product)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {/* Front Image */}
        <img
          src={product.images.front}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          } group-hover:opacity-0`}
          onLoad={() => setImageLoaded(true)}
        />
        {/* Back Image */}
        {product.images.back && (
          <img
            src={product.images.back}
            alt={`${product.name} - Back`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              backImageLoaded ? "opacity-0 group-hover:opacity-100" : "opacity-0"
            } group-hover:opacity-100`}
            onLoad={() => setBackImageLoaded(true)}
          />
        )}

        {/* Tag Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {tagBadges.map((badge) => (
            <Badge
              key={badge.label}
              variant={badge.variant}
              className="px-2.5 py-1 text-[10px] font-semibold gap-1 bg-white text-black border-0"
            >
              <badge.icon className="h-3 w-3" />
              {badge.label}
            </Badge>
          ))}
          {product.boosterExclusive && (
            <Badge className="px-2.5 py-1 text-[10px] font-semibold gap-1 bg-foreground text-background border-0">
              <Crown className="h-3 w-3" />
              BOOSTER
            </Badge>
          )}
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-foreground/90 text-background backdrop-blur-sm border-0 px-3 py-1 text-sm font-semibold">
            {product.price === 0 ? "Free" : `${product.price}R$`}
          </Badge>
        </div>

        {/* Owned Indicator */}
        {owned && (
          <div className="absolute bottom-3 right-3 z-10">
            <Badge className="bg-foreground text-background border-0 px-2.5 py-1 text-xs font-semibold gap-1">
              <Check className="h-3 w-3" />
              Owned
            </Badge>
          </div>
        )}

        {/* Add to Cart Button (on hover) */}
        {!owned && (
          <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Button
              size="sm"
              className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90 shadow-lg"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold mb-1 group-hover:text-muted-foreground transition-colors truncate">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-2">
          Made by {product.maker}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
      </div>

      {/* Border Animation on Hover */}
      <div className="absolute inset-0 border-2 border-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
    </motion.div>
  )
}
