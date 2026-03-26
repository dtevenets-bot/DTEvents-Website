"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, Palette } from "lucide-react"

const commissions = [
  {
    id: 1,
    name: "Unity ELITE 5 PRO FB4",
    description: "Professional laser system with FB4 control. Custom commission for advanced lighting setups.",
    frontImage: "/Images/unity-elite-5-front.png",
    backImage: "/Images/unity-elite-5-back.png",
  },
  {
    id: 2,
    name: "Clubmax 10 FB4",
    description: "Compact yet powerful laser fixture with full FB4 integration. Perfect for club installations.",
    frontImage: "/Images/clubmax-10-front.png",
    backImage: "/Images/clubmax-10-back.png",
  },
  {
    id: 3,
    name: "Showven UFlamer",
    description: "Stunning flame effect system for dramatic stage presentations. Commission-only availability.",
    frontImage: "/Images/showven-uflamer-front.png",
    backImage: "/Images/showven-uflamer-back.png",
  },
  {
    id: 4,
    name: "Salamander Quad Pro",
    description: "Four-head effect system creating mesmerizing patterns. Bespoke commissions available.",
    frontImage: "/Images/salamander-quad-front.png",
    backImage: "/Images/salamander-quad-back.png",
  },
]

function CommissionCard({ commission }: { commission: typeof commissions[0] }) {
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
          background: `radial-gradient(250px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,1), transparent 40%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          padding: '2px',
        }}
      />

      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={commission.frontImage} alt={commission.name} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
        <img src={commission.backImage} alt={`${commission.name} - Back`} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 text-black rounded-full text-xs font-semibold">COMMISSION</div>
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold mb-2 group-hover:text-muted-foreground transition-colors">{commission.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{commission.description}</p>
      </div>
    </div>
  )
}

export function CommissionsSection() {
  return (
    <section id="commissions" className="py-20 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full mb-6"><Palette className="h-4 w-4" /><span className="text-sm font-medium">Custom Work</span></div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Commissions</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Need something custom? We create bespoke fixtures tailored to your exact specifications. Join our Discord to discuss.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {commissions.map((commission) => (
            <CommissionCard key={commission.id} commission={commission} />
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mt-12">
          <a href="https://discord.gg/YrsyVzxk8H" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background font-semibold rounded-md hover:bg-foreground/90 transition-colors">Request a Commission <ArrowUpRight className="h-5 w-5" /></a>
        </motion.div>
      </div>
    </section>
  )
}
