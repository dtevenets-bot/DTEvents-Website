'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CubeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import type { UserProduct } from '@/types';

export function MyProductsView() {
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/user/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">My Products</h2>
        <p className="text-sm text-soft-fg">
          Products you own and have been granted access to.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="py-0">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-soft-fg">
          <CubeIcon className="size-12 mx-auto mb-4 opacity-40" />
          <p>You don&apos;t own any products yet.</p>
          <p className="text-sm mt-1">Browse the store to find something you like!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((up, idx) => (
            <motion.div
              key={up.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(idx * 0.05, 0.3) }}
            >
              <Card className="border py-0">
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="size-10 bg-soft rounded-md flex items-center justify-center shrink-0">
                      <CheckCircleIcon className="size-5 text-green-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {up.productName}
                      </h3>
                      <p className="text-xs text-soft-fg">
                        ID: {up.productId.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    Active
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
