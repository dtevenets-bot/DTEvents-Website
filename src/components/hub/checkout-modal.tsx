"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ExternalLink, Check, AlertCircle, Loader2, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type CheckoutStep = "summary" | "processing" | "success" | "error"

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { data: session } = useSession()
  const { items, totalPrice, clearCart } = useCartStore()
  const { toast } = useToast()
  const [step, setStep] = React.useState<CheckoutStep>("summary")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const total = totalPrice()
  const robloxUserId = (session?.user as any)?.robloxUserId

  React.useEffect(() => {
    if (open) {
      setStep("summary")
      setErrorMessage(null)
    }
  }, [open])

  const handleCheckout = async () => {
    if (!robloxUserId) return

    setStep("processing")

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          robloxUserId,
          discordId: (session?.user as any)?.discordId ?? "",
          products: items,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save cart")
      }

      setStep("success")
      clearCart()

      // Open Roblox Hub in new tab after a short delay
      setTimeout(() => {
        window.open(
          "https://www.roblox.com/games/92326562289312/DT-Events-Hub",
          "_blank"
        )
      }, 1000)
    } catch {
      setStep("error")
      setErrorMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Checkout</DialogTitle>
              <DialogDescription>
                Review your order before completing the purchase.
              </DialogDescription>
            </DialogHeader>

            {/* Summary Step */}
            {step === "summary" && (
              <div className="mt-6 space-y-4">
                {/* Roblox ID */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Roblox ID</span>
                  {robloxUserId ? (
                    <span className="text-sm font-mono font-medium">{robloxUserId}</span>
                  ) : (
                    <span className="text-sm text-destructive">Not linked</span>
                  )}
                </div>

                <Separator />

                {/* Cart Items */}
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between text-sm">
                      <span className="truncate flex-1 mr-4">{item.productName}</span>
                      <span className="text-muted-foreground shrink-0">
                        x{item.quantity} — {item.productPrice * item.quantity === 0 ? "Free" : `${item.productPrice * item.quantity}R$`}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Total */}
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{total === 0 ? "Free" : `${total}R$`}</span>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <Button
                    onClick={handleCheckout}
                    className="w-full h-12 gap-2 font-semibold"
                    disabled={!robloxUserId}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    Purchase on Roblox
                  </Button>
                  {!robloxUserId && (
                    <p className="text-xs text-destructive text-center">
                      Please link your Roblox account before checking out.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Processing Step */}
            {step === "processing" && (
              <div className="mt-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="h-12 w-12 animate-spin mb-4" />
                <h3 className="text-lg font-semibold mb-2">Processing your order...</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we prepare your purchase.
                </p>
              </div>
            )}

            {/* Success Step */}
            {step === "success" && (
              <div className="mt-12 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-foreground/10 flex items-center justify-center mb-4">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Order Confirmed!</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Your cart has been saved. You&apos;ll be redirected to the Roblox Hub to complete your purchase.
                  The Roblox Hub should open in a new tab automatically.
                </p>
                <Button
                  asChild
                  className="gap-2"
                >
                  <a
                    href="https://www.roblox.com/games/92326562289312/DT-Events-Hub"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Roblox Hub
                  </a>
                </Button>
              </div>
            )}

            {/* Error Step */}
            {step === "error" && (
              <div className="mt-12 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-xl font-bold mb-2">Something went wrong</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {errorMessage ?? "An unexpected error occurred. Please try again."}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep("summary")
                      setErrorMessage(null)
                    }}
                  >
                    Go Back
                  </Button>
                  <Button onClick={handleCheckout}>
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
