'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CubeIcon, CheckCircleIcon, ArrowDownTrayIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserProduct } from '@/types';

export function MyProductsView() {
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<{ productId: string; message: string } | null>(null);

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

  const handleDownload = async (productId: string, productName: string) => {
    setDownloadingId(productId);
    setDownloadError(null);
    try {
      const res = await fetch(`/api/download?productId=${productId}`);

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Download failed' }));

        if (res.status === 401) {
          throw new Error('Please log in with a linked Roblox account to download.');
        } else if (res.status === 403) {
          throw new Error('You do not own this product. Purchase or claim it first from the store.');
        } else if (res.status === 404) {
          throw new Error('No file is available for download for this product.');
        } else {
          throw new Error(data.error || 'Download failed');
        }
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${productName}.rbxm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setDownloadError({
        productId,
        message: err instanceof Error ? err.message : 'Failed to download file',
      });
    } finally {
      setDownloadingId(null);
    }
  };

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
                <Skeleton className="h-8 w-24" />
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
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
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
                  </div>
                  <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full hover:bg-ink hover:text-page"
                    disabled={downloadingId === up.productId}
                    onClick={() => handleDownload(up.productId, up.productName)}
                  >
                    {downloadingId === up.productId ? (
                      <svg className="size-4 animate-spin mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <ArrowDownTrayIcon className="size-4 mr-1.5" />
                    )}
                    {downloadingId === up.productId ? 'Downloading...' : 'Download File'}
                  </Button>
                  <AnimatePresence>
                    {downloadError && downloadError.productId === up.productId && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-1.5 text-xs text-red-500"
                      >
                        <ExclamationTriangleIcon className="size-3.5 mt-0.5 shrink-0" />
                        <span>{downloadError.message}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
