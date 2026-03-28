"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart, Check, Crown, Sparkles, Tag, Zap } from "lucide-react"
import { type Product } from "@/types"
import { useCartStore } from "@/stores/cart-store"
import { useToast } from "@/hooks/use-toast"

interface ProductDetailModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  owned?: boolean
}

const tagBadgeMap: Record<string, { icon: React.ElementType; label: string }> = {
  new: { icon: Sparkles, label: "NEW" },
  budget: { icon: Tag, label: "BUDGET" },
  free: { icon: Tag, label: "FREE" },
  flux_kit_ready: { icon: Zap, label: "FLUX KIT READY" },
}

export function ProductDetailModal({ product, open, onOpenChange, owned = false }: ProductDetailModalProps) {
  const [showBack, setShowBack] = React.useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const { toast } = useToast()

  React.useEffect(() => {
    if (open) setShowBack(false)
  }, [open])

  if (!product) return null

  const tagBadges = product.tags.map((tag) => tagBadgeMap[tag]).filter(Boolean)

  const handleAddToCart = () => {
    addItem(product)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {tagBadges.map((badge) => (
                  <Badge
                    key={badge.label}
                    variant="outline"
                    className="gap-1 text-xs font-semibold"
                  >
                    <badge.icon className="h-3 w-3" />
                    {badge.label}
                  </Badge>
                ))}
                {product.boosterExclusive && (
                  <Badge className="gap-1 text-xs font-semibold">
                    <Crown className="h-3 w-3" />
                    Booster Exclusive
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
              <DialogDescription className="text-base">
                Made by {product.maker}
              </DialogDescription>
            </DialogHeader>

            {/* Image */}
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-muted mb-6">
              <img
                src={showBack && product.images.back ? product.images.back : product.images.front}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.images.back && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-3 right-3 bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm"
                  onClick={() => setShowBack(!showBack)}
                >
                  {showBack ? "Front View" : "Back View"}
                </Button>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {product.price === 0 ? "Free" : `${product.price}R$`}
                </span>
                <Badge variant="outline" className="text-xs">
                  Type: {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                </Badge>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Product ID</span>
                  <p className="font-mono text-xs mt-1">{product.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Maker</span>
                  <p className="mt-1">{product.maker}</p>
                </div>
              </div>

              <Separator />

              {/* Action Button */}
              {owned ? (
                <Button
                  disabled
                  className="w-full h-12 gap-2"
                  variant="outline"
                >
                  <Check className="h-5 w-5" />
                  Already Owned
                </Button>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  className="w-full h-12 gap-2 font-semibold"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart — {product.price === 0 ? "Free" : `${product.price}R$`}
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
