'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowPathIcon, ShoppingCartIcon, ArrowTopRightOnSquareIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/stores/cart-store';

export function CheckoutModal() {
  const [open, setOpen] = useState(false);
  const [robloxUserId, setRobloxUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-checkout', handler);
    return () => window.removeEventListener('open-checkout', handler);
  }, []);

  useEffect(() => {
    if (session?.user?.robloxUserId) {
      setRobloxUserId(session.user.robloxUserId);
    }
  }, [session]);

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!robloxUserId || items.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save cart');
      }

      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>
            {success
              ? 'Your cart has been saved. Complete the purchase in-game.'
              : 'Review your cart and enter your Roblox User ID.'}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircleIcon className="size-16 text-green-500" />
            <p className="text-sm text-center">
              Cart saved successfully! Open the Roblox hub to complete your purchase.
            </p>
            <a
              href="https://www.roblox.com/games/start?placeId=PLACEHOLDER"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-9 px-4 py-2 w-full hover:bg-ink hover:text-page"
            >
              <ArrowTopRightOnSquareIcon className="size-4 mr-2" />
              Open Roblox Hub
            </a>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-48 -mx-6 px-6">
              <div className="space-y-3 py-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">{item.productName}</span>
                    <span className="font-medium ml-2">R${item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold">R${totalPrice}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="robloxUserId">Roblox User ID</Label>
                <Input
                  id="robloxUserId"
                  placeholder="Enter your Roblox User ID"
                  value={robloxUserId}
                  onChange={(e) => setRobloxUserId(e.target.value)}
                  required
                />
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !robloxUserId || items.length === 0}
                >
                  {loading && <ArrowPathIcon className="size-4 animate-spin" />}
                  {loading ? 'Processing...' : 'Save Cart & Continue'}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
