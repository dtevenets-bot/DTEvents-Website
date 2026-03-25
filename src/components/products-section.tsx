"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, Sparkles, Tag } from "lucide-react"

const products = [
  {
    id: 1,
    name: "DT 240 Moving Head Beam",
    price: "200R$",
    maker: "Daniel Tiger",
    description: "Professional moving head beam with stunning effects. Works with Flux Kit from the box.",
    frontImage: "https://cdn.discordapp.com/attachments/1483109202099703918/1483109202342838416/Screenshot_2026-03-17_002153.png?ex=69c49954&is=69c347d4&hm=286b30d050a359ef341550c90b93ed05467afc590b71733d1784c605b544abc6&",
    backImage: "https://cdn.discordapp.com/attachments/1483109202099703918/1483109202921525268/Screenshot_2026-03-17_002204.png?ex=69c49954&is=69c347d4&hm=fb13c893c827b4e8235387f73b87ad5b873975e8e2c5f345486e1bd2cbdd60fd&",
    isNew: true,
    isCheap: false,
    fluxKit: true,
  },
  {
    id: 2,
    name: "Shure SLXD2/Nexadyne + SLXD4D",
    price: "80R$",
    maker: "Daniel Tiger",
    description: "Professional wireless microphone system with crystal-clear audio quality.",
    frontImage: "https://cdn.discordapp.com/attachments/1464922415942467647/1464922416332673024/Screenshot_2026-01-12_041231.png?ex=69c45a90&is=69c30910&hm=31abb27c58582342342f9cbd338e58e54af6c26ea9568c3587a4f4596d9d5822&",
    backImage: "https://cdn.discordapp.com/attachments/1464922415942467647/1464922417158688788/Screenshot_2026-01-12_041338.png?ex=69c45a91&is=69c30911&hm=cde5b2d9fe756d30f04aab2a655323a3c35b55a89e0d5015e2f21ae54fc3cff8&",
    isNew: false,
    isCheap: true,
    fluxKit: false,
  },
  {
    id: 3,
    name: "Chauvet Maverick Force X Profile & Spot",
    price: "220R$",
    maker: "Daniel Tiger",
    description: "Powerful dual-mode fixture offering both profile and spot capabilities. Works with Flux Kit from the box.",
    frontImage: "https://cdn.discordapp.com/attachments/1461526667074736221/1461526667829973192/Screenshot_2026-01-15_092706.png?ex=69c48647&is=69c334c7&hm=212797a0afb810b84d092ba18562c5e3e8087a5edd6f0fd30e97c47d4f998d0b&",
    backImage: "https://cdn.discordapp.com/attachments/1461526667074736221/1461526669478199317/Screenshot_2026-01-15_092843.png?ex=69c48647&is=69c334c7&hm=b74d278e32dbad831d07f927b19637691ee843cb8a5267acd086ca6fe6d45dad&",
    isNew: false,
    isCheap: false,
    fluxKit: true,
  },
  {
    id: 4,
    name: "GLP Burst 1",
    price: "180R$",
    maker: "Daniel Tiger",
    description: "High-performance burst effect light creating stunning visual displays. Works with Flux Kit from the box.",
    frontImage: "https://cdn.discordapp.com/attachments/1464100546188414986/1464100546502856884/Screenshot_2026-01-20_154703.png?ex=69c4a8e3&is=69c35763&hm=73a7952265a269f5be7b9768399138b8b777a75757cf89fb1bee7f4c9013133d&",
    backImage: "https://cdn.discordapp.com/attachments/1464100546188414986/1464100547589050500/Screenshot_2026-01-20_154744.png?ex=69c4a8e4&is=69c35764&hm=074cb12be086ef2816d66479e3fcaacca7b252b44f949239049dde0648426ea4&",
    isNew: false,
    isCheap: false,
    fluxKit: true,
  },
  {
    id: 5,
    name: "Chauvet COLORado PXL Bar 8",
    price: "150R$",
    maker: "Daniel Tiger",
    description: "Versatile pixel bar with rich colors and smooth mixing. Works with Flux Kit from the box.",
    frontImage: "https://cdn.discordapp.com/attachments/1461526163569508452/1461526165251686430/Screenshot_2026-01-03_205840.png?ex=69c485cf&is=69c3344f&hm=702de165d81461980dc2109f312e06be87d0b9ebc69778d75d161e508bdc91d3&",
    backImage: "https://cdn.discordapp.com/attachments/1461526163569508452/1461526166388211918/Screenshot_2026-01-03_205904.png?ex=69c485cf&is=69c3344f&hm=0e842a6bb9ea78b2b16a466b9a99a8c95524ecadf5848ab81e76b3f9d4847328&",
    isNew: false,
    isCheap: true,
    fluxKit: true,
  },
  {
    id: 6,
    name: "Chauvet Strike V",
    price: "180R$",
    maker: "Daniel Tiger",
    description: "Dynamic strobe effect with multiple patterns and intensities. Works with Flux Kit from the box.",
    frontImage: "https://cdn.discordapp.com/attachments/1461626266384859239/1461626267047821378/Screenshot_2026-01-16_173854.png?ex=69c43a49&is=69c2e8c9&hm=01b3a0481d0f93ac1d7d3a9e81f62d8aa0bd31af1be11042580084d70f9d8822&",
    backImage: "https://cdn.discordapp.com/attachments/1461626266384859239/1461626268633272333/Screenshot_2026-01-16_173932.png?ex=69c43a4a&is=69c2e8ca&hm=c994ee78d526ef7cba7e1c9ede916410299ea7e38af53ba46ea94a7411ca4a3d&",
    isNew: false,
    isCheap: false,
    fluxKit: true,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

export function ProductsSection() {
  return (
    <section id="products" className="py-20 sm:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Our Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional-grade fixtures and equipment. Hover to see more details.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-lg border border-border bg-card cursor-pointer"
            >
              {/* Image Container with Front/Back */}
              <div className="relative aspect-[4/3] overflow-hidden">
                {/* Front Image */}
                <img
                  src={product.frontImage}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-100 group-hover:opacity-0"
                />
                {/* Back Image */}
                <img
                  src={product.backImage}
                  alt={`${product.name} - Back`}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                />
                
                {/* Tags */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  {product.isNew && (
                    <span className="px-3 py-1 text-xs font-semibold bg-white text-black rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      NEW
                    </span>
                  )}
                  {product.isCheap && (
                    <span className="px-3 py-1 text-xs font-semibold bg-foreground text-background rounded-full flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      BUDGET
                    </span>
                  )}
                </div>
                
                {/* Price Badge */}
                <div className="absolute top-3 right-3 px-3 py-1 bg-black/80 text-white rounded-full text-sm font-semibold">
                  {product.price}
                </div>

                {/* Flux Kit Badge */}
                {product.fluxKit && (
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-white/90 text-black rounded text-xs font-medium">
                    Flux Kit Ready
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-1 group-hover:text-muted-foreground transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Made by {product.maker}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </div>

              {/* Border Animation on Hover */}
              <div className="absolute inset-0 border-2 border-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href="https://www.roblox.com/games/92326562289312/DT-Events-Hub"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-foreground text-foreground font-semibold rounded-md hover:bg-foreground hover:text-background transition-colors duration-300"
          >
            View All Products
            <ArrowUpRight className="h-5 w-5" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
