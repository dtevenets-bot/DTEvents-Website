"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { SearchBar } from "@/components/hub/search-bar"
import { ProductFiltersPanel } from "@/components/hub/product-filters"
import { ProductCard } from "@/components/hub/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { type Product, type ProductFilters } from "@/types"
import { useCartStore } from "@/stores/cart-store"
import { useToast } from "@/hooks/use-toast"
import { PackageOpen, Loader2 } from "lucide-react"

const mockProducts: Product[] = [
  {
    id: "mock1",
    name: "Pioneer DJM V10 Mixer",
    description: "Professional DJ mixer with premium sound quality and intuitive controls for seamless performances.",
    price: 130,
    gamepassId: "",
    active: true,
    createdAt: Date.now(),
    createdBy: "",
    tags: ["new"],
    type: "other",
    images: {
      front: "https://cdn.discordapp.com/attachments/1486281451032023090/1486281451669422110/Screenshot_2026-03-25_182937.png?ex=69c4eef7&is=69c39d77&hm=675d7e1458bb0aad2120b4953f0a2f578fb7026b5475d2a211c86490fa454b4a&",
      back: "https://cdn.discordapp.com/attachments/1486281451032023090/1486281452126605392/Screenshot_2026-03-25_182951.png?ex=69c4eef7&is=69c39d77&hm=4d207751444554c337316fad12b3ca1304bcd691454aa9d4dff9c8aab7c69b22&",
    },
    maker: "Daniel Tiger",
    boosterExclusive: false,
  },
  {
    id: "mock2",
    name: "DT 240 Moving Head Beam",
    description: "Professional moving head beam with stunning effects. Works with Flux Kit from the box.",
    price: 200,
    gamepassId: "",
    active: true,
    createdAt: Date.now(),
    createdBy: "",
    tags: ["flux_kit_ready"],
    type: "venue",
    images: {
      front: "https://cdn.discordapp.com/attachments/1483109202099703918/1483109202342838416/Screenshot_2026-03-17_002153.png?ex=69c49954&is=69c347d4&hm=286b30d050a359ef341550c90b93ed05467afc590b71733d1784c605b544abc6&",
      back: "https://cdn.discordapp.com/attachments/1483109202099703918/1483109202921525268/Screenshot_2026-03-17_002204.png?ex=69c49954&is=69c347d4&hm=fb13c893c827b4e8235387f73b87ad5b873975e8e2c5f345486e1bd2cbdd60fd&",
    },
    maker: "Daniel Tiger",
    boosterExclusive: false,
  },
  {
    id: "mock3",
    name: "Shure SLXD2/Nexadyne + SLXD4D",
    description: "Professional wireless microphone system with crystal-clear audio quality. Budget friendly.",
    price: 80,
    gamepassId: "",
    active: true,
    createdAt: Date.now(),
    createdBy: "",
    tags: ["budget"],
    type: "profile",
    images: {
      front: "https://cdn.discordapp.com/attachments/1464922415942467647/1464922416332673024/Screenshot_2026-01-12_041231.png?ex=69c45a90&is=69c30910&hm=31abb27c58582342342f9cbd338e58e54af6c26ea9568c3587a4f4596d9d5822&",
      back: "https://cdn.discordapp.com/attachments/1464922415942467647/1464922417158688788/Screenshot_2026-01-12_041338.png?ex=69c45a91&is=69c30911&hm=cde5b2d9fe756d30f04aab2a655323a3c35b55a89e0d5015e2f21ae54fc3cff8&",
    },
    maker: "Daniel Tiger",
    boosterExclusive: false,
  },
  {
    id: "mock4",
    name: "Chauvet COLORado PXL Bar 8",
    description: "Versatile pixel bar with rich colors and smooth mixing. Works with Flux Kit from the box. Budget friendly.",
    price: 150,
    gamepassId: "",
    active: true,
    createdAt: Date.now(),
    createdBy: "",
    tags: ["budget", "flux_kit_ready"],
    type: "wash",
    images: {
      front: "https://cdn.discordapp.com/attachments/1461526163569508452/1461526165251686430/Screenshot_2026-01-03_205840.png?ex=69c485cf&is=69c3344f&hm=702de165d81461980dc2109f312e06be87d0b9ebc69778d75d161e508bdc91d3&",
      back: "https://cdn.discordapp.com/attachments/1461526163569508452/1461526166388211918/Screenshot_2026-01-03_205904.png?ex=69c485cf&is=69c3344f&hm=0e842a6bb9ea78b2b16a466b9a99a8c95524ecadf5848ab81e76b3f9d4847328&",
    },
    maker: "Daniel Tiger",
    boosterExclusive: true,
  },
]

interface ProductGridProps {
  onProductClick?: (product: Product) => void
}

export function ProductGrid({ onProductClick }: ProductGridProps) {
  const [filters, setFilters] = React.useState<ProductFilters>({
    search: "",
    tags: [],
    types: [],
    priceMin: null,
    priceMax: null,
    boosterOnly: false,
  })

  const addItem = useCartStore((s) => s.addItem)
  const { toast } = useToast()

  const { data: products, isLoading, isError } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const params = new URLSearchParams()
        if (filters.search) params.set("search", filters.search)
        if (filters.tags.length) params.set("tags", filters.tags.join(","))
        if (filters.types.length) params.set("types", filters.types.join(","))
        if (filters.priceMin !== null) params.set("priceMin", String(filters.priceMin))
        if (filters.priceMax !== null) params.set("priceMax", String(filters.priceMax))
        if (filters.boosterOnly) params.set("boosterOnly", "true")

        const res = await fetch(`/api/products?${params.toString()}`)
        if (!res.ok) throw new Error("Failed to fetch products")
        return res.json()
      } catch {
        return mockProducts
      }
    },
  })

  const filteredProducts = React.useMemo(() => {
    if (!products) return []
    return products.filter((product) => {
      if (!product.active) return false

      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (
          !product.name.toLowerCase().includes(q) &&
          !product.description.toLowerCase().includes(q) &&
          !product.maker.toLowerCase().includes(q)
        ) {
          return false
        }
      }

      if (filters.tags.length > 0) {
        const hasAllTags = filters.tags.every((tag) => product.tags.includes(tag))
        if (!hasAllTags) return false
      }

      if (filters.types.length > 0) {
        if (!filters.types.includes(product.type)) return false
      }

      if (filters.priceMin !== null && product.price < filters.priceMin) return false
      if (filters.priceMax !== null && product.price > filters.priceMax) return false
      if (filters.boosterOnly && !product.boosterExclusive) return false

      return true
    })
  }, [products, filters])

  const handleAddToCart = (product: Product) => {
    addItem(product)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <div className="flex gap-6">
      <ProductFiltersPanel filters={filters} onFiltersChange={setFilters} />

      <div className="flex-1 min-w-0 space-y-6">
        {/* Search Bar */}
        <div className="max-w-xl">
          <SearchBar
            value={filters.search}
            onChange={(search) => setFilters({ ...filters, search })}
          />
        </div>

        {/* Results Count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <PackageOpen className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
            <Button
              variant="outline"
              className="mt-4 hover:bg-foreground hover:text-background transition-colors duration-300"
              onClick={() =>
                setFilters({
                  search: "",
                  tags: [],
                  types: [],
                  priceMin: null,
                  priceMax: null,
                  boosterOnly: false,
                })
              }
            >
              Clear all filters
            </Button>
          </motion.div>
        )}

        {/* Product Grid */}
        {!isLoading && filteredProducts.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={JSON.stringify(filters)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={onProductClick}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
