'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Eye, Search } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { ProductFilters } from '@/components/hub/product-filters';
import { ProductDetailModal } from '@/components/hub/product-detail-modal';
import { motion } from 'framer-motion';
import type { Product, ProductFilters as Filters } from '@/types';

interface ProductGridProps {
  boosterOnly?: boolean;
}

export function ProductGrid({ boosterOnly = false }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const addItem = useCartStore((s) => s.addItem);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));
      if (filters.types && filters.types.length > 0) params.set('types', filters.types.join(','));
      if (filters.priceMin !== undefined) params.set('priceMin', String(filters.priceMin));
      if (filters.priceMax !== undefined) params.set('priceMax', String(filters.priceMax));
      if (boosterOnly) params.set('boosterOnly', 'true');

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [filters, boosterOnly]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.front || '',
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Filters */}
      <div className="lg:w-64 shrink-0">
        <ProductFilters onFilterChange={setFilters} />
      </div>

      {/* Product Grid */}
      <div className="flex-1">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden py-0">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="size-12 mx-auto mb-4 opacity-40" />
            <p>No products found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.05, 0.3) }}
              >
                <Card className="overflow-hidden group border transition-colors hover:bg-foreground hover:text-background py-0">
                  <div
                    className="aspect-video bg-muted overflow-hidden cursor-pointer relative"
                    onClick={() => handleViewProduct(product)}
                  >
                    {product.images?.front ? (
                      <img
                        src={product.images.front}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="size-10 opacity-20" />
                      </div>
                    )}
                    {product.boosterExclusive && (
                      <Badge className="absolute top-2 right-2 text-[10px]">
                        Booster
                      </Badge>
                    )}
                    {!product.active && (
                      <Badge variant="destructive" className="absolute top-2 right-2 text-[10px]">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                      <span className="text-sm font-medium whitespace-nowrap">R${product.price}</span>
                    </div>
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-[10px] group-hover:border-white/30"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs group-hover:border-white/30 group-hover:text-background"
                        onClick={() => handleViewProduct(product)}
                      >
                        <Eye className="size-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="size-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
