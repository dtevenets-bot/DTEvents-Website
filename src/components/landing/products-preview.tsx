"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, Sparkles, Tag, Zap } from "lucide-react"
import type { Product } from "@/types"

const fallbackProducts = [
  {
    id: "fallback-1",
    name: "Pioneer DJM V10 Mixer",
    price: "130R$",
    maker: "Daniel Tiger",
    description: "Professional DJ mixer with premium sound quality and intuitive controls for seamless performances.",
    frontImage: "https://cdn.discordapp.com/attachments/1486281451032023090/1486281451669422110/Screenshot_2026-03-25_182937.png?ex=69c4eef7&is=69c39d77&hm=675d7e1458bb0aad2120b4953f0a2f578fb7026b5475d2a211c86490fa454b4a&",
    backImage: "https://cdn.discordapp.com/attachments/1486281451032023090/1486281452126605392/Screenshot_2026-03-25_182951.png?ex=69c4eef7&is=69c39d77&hm=4d207751444554c337316fad12b3ca1304bcd691454aa9d4dff9c8aab7c69b22&",
    tags: ["new"],
    fluxKit: false,
    boosterExclusive: false,
  },
  {
    id: "fallback-2",
    name: "DT 240 Moving Head Beam",
    price: "200R$",
    maker: "Daniel Tiger",
    description: "Professional moving head beam with stunning effects. Works with Flux Kit from the box.",
    frontImage: "https://cdn.discordapp.com/attachments/1483109202099703918/1483109202342838416/Screenshot_2026-03-17_002153.png?ex=69c49954&is=69c347d4&hm=286b30d050a359ef341550c90b93ed05467afc590b71733d1784c605b544abc6&",
    backImage: "https://cdn.discordapp.com/attachments/1483109202099703918/1483109202921525268/Screenshot_2026-03-17_002204.png?ex=69c49954&is=69c347d4&hm=fb13c893c827b4e8235387f73b87ad5b873975e8e2c5f345486e1bd2cbdd60fd&",
    tags: ["flux_kit_ready"],
    fluxKit: true,
    boosterExclusive: false,
  },
  {
    id: "fallback-3",
    name: "Shure SLXD2/Nexadyne + SLXD4D",
    price: "80R$",
    maker: "Daniel Tiger",
    description: "Professional wireless microphone system with crystal-clear audio quality.",
    frontImage: "https://cdn.discordapp.com/attachments/1464922415942467647/1464922416332673024/Screenshot_2026-01-12_041231.png?ex=69c45a90&is=69c30910&hm=31abb27c58582342342f9cbd338e58e54af6c26ea9568c3587a4f4596d9d5822&",
    backImage: "https://cdn.discordapp.com/attachments/1464922415942467647/1464922417158688788/Screenshot_2026-01-12_041338.png?ex=69c45a91&is=69c30911&hm=cde5b2d9fe756d30f04aab2a655323a3c35b55a89e0d5015e2f21ae54fc3cff8&",
    tags: ["budget"],
    fluxKit: false,
    boosterExclusive: false,
  },
  {
    id: "fallback-4",
    name: "Chauvet Maverick Force X Profile & Spot",
    price: "220R$",
    maker: "Daniel Tiger",
    description: "Powerful dual-mode fixture offering both profile and spot capabilities. Works with Flux Kit from the box.",
    frontImage: "https://cdn.discordapp.com/attachments/1461526667074736221/1461526667829973192/Screenshot_2026-01-15_092706.png?ex=69c48647&is=69c334c7&hm=212797a0afb810b84d092ba18562c5e3e8087a5edd6f0fd30e97c47d4f998d0b&",
    backImage: "https://cdn.discordapp.com/attachments/1461526667074736221/1461526669478199317/Screenshot_2026-01-15_092843.png?ex=69c48647&is=69c334c7&hm=b74d278e32dbad831d07f927b19637691ee843cb8a5267acd086ca6fe6d45dad&",
    tags: ["flux_kit_ready"],
    fluxKit: true,
    boosterExclusive: false,
  },
]

export function ProductsPreview() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["landing-products"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/products")
        if (!res.ok) throw new Error()
        return res.json()
      } catch {
        return undefined
      }
    },
  })

  const displayProducts = products ?? fallbackProducts

  return (
    <section id="products" className="py-20 sm:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Our Products</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Professional-grade fixtures and equipment. Hover to see more details.</p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-5 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.slice(0, 8).map((product) => {
              const isNew = product.tags?.includes("new")
              const isBudget = product.tags?.includes("budget")
              const isFluxKit = product.tags?.includes("flux_kit_ready")
              const isBoosterExclusive = product.boosterExclusive
              const priceStr = product.price === 0 ? "Free" : `${product.price}R$`
              const frontImg = product.images?.front || ""
              const backImg = product.images?.back || ""

              return (
                <div key={product.id} className="group relative overflow-hidden rounded-lg border border-border bg-card cursor-pointer">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {frontImg && <img src={frontImg} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-100 group-hover:opacity-0" />}
                    {backImg && <img src={backImg} alt={`${product.name} - Back`} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100" />}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {isNew && <span className="px-3 py-1 text-xs font-semibold bg-white text-black rounded-full flex items-center gap-1"><Sparkles className="h-3 w-3" />NEW</span>}
                      {isBudget && <span className="px-3 py-1 text-xs font-semibold bg-foreground text-background rounded-full flex items-center gap-1"><Tag className="h-3 w-3" />BUDGET</span>}
                    </div>
                    <div className="absolute top-3 right-3 px-3 py-1 bg-black/80 text-white rounded-full text-sm font-semibold">{priceStr}</div>
                    {isFluxKit && <div className="absolute bottom-3 left-3 px-2 py-1 bg-white/90 text-black rounded text-xs font-medium flex items-center gap-1"><Zap className="h-3 w-3" />Flux Kit Ready</div>}
                    {isBoosterExclusive && <div className="absolute bottom-3 right-3 px-2 py-1 bg-foreground text-background rounded text-xs font-medium">Booster Only</div>}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold mb-1 group-hover:text-muted-foreground transition-colors">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">Made by {product.maker}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  </div>
                  <div className="absolute inset-0 border-2 border-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
                </div>
              )
            })}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mt-12">
          <a href="https://www.roblox.com/games/92326562289312/DT-Events-Hub" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-foreground text-foreground font-semibold rounded-md hover:bg-foreground hover:text-background transition-colors">View All Products <ArrowUpRight className="h-5 w-5" /></a>
        </motion.div>
      </div>
    </section>
  )
}
