"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, Sparkles, Tag } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Pioneer DJM V10 Mixer",
    price: "130R$",
    maker: "Daniel Tiger",
    description: "Professional DJ mixer with premium sound quality and intuitive controls for seamless performances.",
    frontImage: "/Images/pioneer-djm-v10-front.png",
    backImage: "/Images/pioneer-djm-v10-back.png",
    isNew: true,
    isCheap: false,
    fluxKit: false,
  },
  {
    id: 2,
    name: "DT 240 Moving Head Beam",
    price: "200R$",
    maker: "Daniel Tiger",
    description: "Professional moving head beam with stunning effects. Works with Flux Kit from the box.",
    frontImage: "/Images/dt-240-front.png",
    backImage: "/Images/dt-240-back.png",
    isNew: false,
    isCheap: false,
    fluxKit: true,
  },
  {
    id: 3,
    name: "Shure SLXD2/Nexadyne + SLXD4D",
    price: "80R$",
    maker: "Daniel Tiger",
    description: "Professional wireless microphone system with crystal-clear audio quality.",
    frontImage: "/Images/shure-slxd2-front.png",
    backImage: "/Images/shure-slxd2-back.png",
    isNew: false,
    isCheap: true,
    fluxKit: false,
  },
  {
    id: 4,
    name: "Chauvet Maverick Force X Profile & Spot",
    price: "220R$",
    maker: "Daniel Tiger",
    description: "Powerful dual-mode fixture offering both profile and spot capabilities. Works with Flux Kit from the box.",
    frontImage: "/Images/maverick-force-x-front.png",
    backImage: "/Images/maverick-force-x-back.png",
    isNew: false,
    isCheap: false,
    fluxKit: true,
  },
  {
    id: 5,
    name: "GLP Burst 1",
    price: "180R$",
    maker: "Daniel Tiger",
    description: "High-performance burst effect light creating stunning visual displays. Works with Flux Kit from the box.",
    frontImage: "/Images/glp-burst-1-front.png",
    backImage: "/Images/glp-burst-1-back.png",
    isNew: false,
    isCheap: false,
    fluxKit: true,
  },
  {
    id: 6,
    name: "Chauvet COLORado PXL Bar 8",
    price: "150R$",
    maker: "Daniel Tiger",
    description: "Versatile pixel bar with rich colors and smooth mixing. Works with Flux Kit from the box.",
    frontImage: "/Images/colorado-pxl-bar-front.png",
    backImage: "/Images/colorado-pxl-bar-back.png",
    isNew: false,
    isCheap: true,
    fluxKit: true,
  },
  {
    id: 7,
    name: "Chauvet Strike V",
    price: "180R$",
    maker: "Daniel Tiger",
    description: "Dynamic strobe effect with multiple patterns and intensities. Works with Flux Kit from the box.",
    frontImage: "/Images/strike-v-front.png",
    backImage: "/Images/strike-v-back.png",
    isNew: false,
    isCheap: false,
    fluxKit: true,
  },
  {
    id: 8,
    name: "Chauvet Vesuvio II",
    price: "150R$",
    maker: "Daniel Tiger",
    description: "Volcanic effect light creating dramatic atmospheric scenes. Works with Flux Kit from the box.",
    frontImage: "/Images/vesuvio-ii-front.png",
    backImage: "/Images/vesuvio-ii-back.png",
    isNew: false,
    isCheap: true,
    fluxKit: true,
  },
]

function ProductCard({ product }: { product: typeof products[0] }) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = React.useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div
      ref={cardRef}
      className="group relative overflow-hidden rounded-lg border border-border bg-card cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Border Spotlight Effect - Only on the border */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-lg transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(250px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,1), transparent 30%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          padding: '2px',
        }}
      />

      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={product.frontImage} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
        <img src={product.backImage} alt={`${product.name} - Back`} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {product.isNew && <span className="px-3 py-1 text-xs font-semibold bg-white text-black rounded-full flex items-center gap-1"><Sparkles className="h-3 w-3" />NEW</span>}
          {product.isCheap && <span className="px-3 py-1 text-xs font-semibold bg-foreground text-background rounded-full flex items-center gap-1"><Tag className="h-3 w-3" />BUDGET</span>}
        </div>
        <div className="absolute top-3 right-3 px-3 py-1 bg-black/80 text-white rounded-full text-sm font-semibold">{product.price}</div>
        {product.fluxKit && <div className="absolute bottom-3 left-3 px-2 py-1 bg-white/90 text-black rounded text-xs font-medium">Flux Kit Ready</div>}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-1 group-hover:text-muted-foreground transition-colors">{product.name}</h3>
        <p className="text-xs text-muted-foreground mb-2">Made by {product.maker}</p>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
      </div>
    </div>
  )
}

export function ProductsSection() {
  return (
    <section id="products" className="py-20 sm:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Our Products</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Professional-grade fixtures and equipment. Hover to see more details.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mt-12">
          <a href="https://www.roblox.com/games/92326562289312/DT-Events-Hub" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-foreground text-foreground font-semibold rounded-md hover:bg-foreground hover:text-background transition-colors">View All Products <ArrowUpRight className="h-5 w-5" /></a>
        </motion.div>
      </div>
    </section>
  )
}
