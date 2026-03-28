"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Minus, Plus, Trash2, ShoppingBag, CreditCard } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"

interface CartSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCheckout: () => void
}

export function CartSidebar({ open, onOpenChange, onCheckout }: CartSidebarProps) {
  const { data: session } = useSession()
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore()
  const { toast } = useToast()

  const total = totalPrice()
  const robloxUserId = (session?.user as any)?.robloxUserId

  const handleRemoveItem = (productId: string, productName: string) => {
    removeItem(productId)
    toast({
      title: "Removed from cart",
      description: `${productName} has been removed from your cart.`,
    })
  }

  const handleClearCart = () => {
    clearCart()
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <ShoppingBag className="h-5 w-5" />
            Your Cart
            {items.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({items.length} item{items.length !== 1 ? "s" : ""})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground text-center">
              Browse products and add them to your cart to get started.
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-4 p-3 border border-border rounded-lg bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold truncate">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {item.productPrice === 0 ? "Free" : `${item.productPrice}R$`} each
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-foreground hover:text-background transition-colors"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-foreground hover:text-background transition-colors"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[60px]">
                      <p className="text-sm font-semibold">
                        {item.productPrice * item.quantity === 0
                          ? "Free"
                          : `${item.productPrice * item.quantity}R$`}
                      </p>
                    </div>

                    {/* Remove */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      onClick={() => handleRemoveItem(item.productId, item.productName)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t border-border p-6 space-y-4">
              {/* Roblox ID */}
              {robloxUserId ? (
                <p className="text-xs text-muted-foreground text-center">
                  Your Roblox ID: <span className="font-mono font-medium">{robloxUserId}</span>
                </p>
              ) : (
                <p className="text-xs text-destructive text-center">
                  ⚠️ Link your Roblox account before checking out
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold">
                  {total === 0 ? "Free" : `${total}R$`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="hover:bg-foreground hover:text-background transition-colors duration-300"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </Button>
                <Button
                  className="gap-2 font-semibold"
                  onClick={onCheckout}
                  disabled={!robloxUserId}
                >
                  <CreditCard className="h-4 w-4" />
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
