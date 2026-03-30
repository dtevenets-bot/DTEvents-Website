'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCartIcon, ArrowLeftIcon, ArrowRightIcon, GiftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useCartStore } from '@/stores/cart-store';
import type { Product } from '@/types';

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailModal({
  product,
  open,
  onOpenChange,
}: ProductDetailModalProps) {
  const [showBack, setShowBack] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimError, setClaimError] = useState('');
  const addItem = useCartStore((s) => s.addItem);

  const isFree = product?.price === 0;

  const handleAddToCart = () => {
    addItem({
      productId: product!.id,
      productName: product!.name,
      price: product!.price,
      quantity: 1,
      image: product!.images?.front || '',
    });
    onOpenChange(false);
  };

  const handleClaimFree = async () => {
    if (!product) return;
    setClaiming(true);
    setClaimError('');
    setClaimed(false);

    try {
      const res = await fetch('/api/products/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.alreadyOwned) {
          setClaimed(true);
        } else {
          throw new Error(data.error || 'Failed to claim product');
        }
      } else {
        setClaimed(true);
      }
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : 'Failed to claim product');
    } finally {
      setClaiming(false);
    }
  };

  // Reset state when product changes
  const prevProductId = useState<string | null>(null)[0];
  if (product && product.id !== prevProductId) {
    // We use a ref approach — just reset when dialog opens
  }

  if (!product) return null;

  const currentImage = showBack
    ? product.images?.back || ''
    : product.images?.front || '';

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          setClaiming(false);
          setClaimed(false);
          setClaimError('');
          setShowBack(false);
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {product.description || 'No description available.'}
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-video bg-soft rounded-lg overflow-hidden">
          {currentImage ? (
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-soft-fg">
              No image available
            </div>
          )}

          {product.images?.front && product.images?.back && (
            <div className="absolute bottom-2 right-2 flex gap-1">
              <Button
                variant="secondary"
                size="sm"
                className={`text-xs h-7 ${!showBack ? 'bg-ink text-page' : ''}`}
                onClick={() => setShowBack(false)}
              >
                Front
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className={`text-xs h-7 ${showBack ? 'bg-ink text-page' : ''}`}
                onClick={() => setShowBack(true)}
              >
                Back
              </Button>
            </div>
          )}

          {product.images?.front && product.images?.back && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                onClick={() => setShowBack((prev) => !prev)}
              >
                <ArrowLeftIcon className="size-4" />
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                onClick={() => setShowBack((prev) => !prev)}
              >
                <ArrowRightIcon className="size-4" />
              </button>
            </>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {isFree ? (
                  <span className="text-green-500">Free</span>
                ) : (
                  <>R${product.price}</>
                )}
              </span>
              {isFree && (
                <Badge className="bg-green-500/15 text-green-500 border-green-500/20">
                  Free Product
                </Badge>
              )}
            </div>
            {product.maker && (
              <span className="text-sm text-soft-fg">by {product.maker}</span>
            )}
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
              {product.boosterExclusive && (
                <Badge>Booster Exclusive</Badge>
              )}
            </div>
          )}

          {claimed ? (
            <Button
              className="w-full bg-green-500 hover:bg-green-600"
              disabled
            >
              <CheckCircleIcon className="size-4 mr-2" />
              {claimError.includes('already') ? 'Already Owned — In My Products' : 'Claimed — Go to My Products to Download'}
            </Button>
          ) : isFree ? (
            <div className="space-y-2">
              <Button
                className="w-full bg-green-500 hover:bg-green-600"
                onClick={handleClaimFree}
                disabled={claiming}
              >
                {claiming ? (
                  <svg className="size-4 animate-spin mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <GiftIcon className="size-4 mr-2" />
                )}
                {claiming ? 'Claiming...' : 'Claim for Free'}
              </Button>
              <p className="text-xs text-soft-fg text-center">
                This product will be added directly to your &quot;My Products&quot; page where you can download it.
              </p>
            </div>
          ) : (
            <Button
              className="w-full hover:bg-ink/90"
              onClick={handleAddToCart}
            >
              <ShoppingCartIcon className="size-4 mr-2" />
              Add to Cart — R${product.price}
            </Button>
          )}

          {claimError && !claimError.includes('already') && (
            <p className="text-xs text-red-500 text-center">{claimError}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
