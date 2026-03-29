'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Trash2, CreditCard } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';

export function CartSidebar() {
  const [open, setOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalPrice = useCartStore((s) => s.totalPrice());

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-cart', handler);
    return () => window.removeEventListener('open-cart', handler);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="size-4" />
            Cart ({items.length})
          </SheetTitle>
          <SheetDescription>
            Review your items before checkout.
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground py-12">
            <p className="text-sm">Your cart is empty.</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className="size-12 bg-muted rounded-md overflow-hidden shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="size-4 opacity-40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        R${item.price} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        R${item.price * item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 hover:bg-destructive hover:text-white"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="flex-col gap-3 border-t pt-4 -mx-6 px-6">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium">Total</span>
                <span className="text-lg font-bold">R${totalPrice}</span>
              </div>
              <Button
                className="w-full hover:bg-foreground/90"
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent('open-checkout'));
                }}
              >
                <CreditCard className="size-4 mr-2" />
                Checkout
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
