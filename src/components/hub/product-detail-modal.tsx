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
import { ShoppingCartIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
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
  const addItem = useCartStore((s) => s.addItem);

  if (!product) return null;

  const currentImage = showBack
    ? product.images?.back || ''
    : product.images?.front || '';

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.front || '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <span className="text-2xl font-bold">R${product.price}</span>
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

          <Button
            className="w-full hover:bg-ink/90"
            onClick={handleAddToCart}
          >
            <ShoppingCartIcon className="size-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
