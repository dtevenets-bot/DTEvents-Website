"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, Palette } from "lucide-react"

const commissions = [
  {
    id: 1,
    name: "Unity ELITE 5 PRO FB4",
    description: "Professional laser system with FB4 control. Custom commission for advanced lighting setups.",
    frontImage: "https://cdn.discordapp.com/attachments/1468086865629286545/1486255013096329266/Screenshot_2026-03-07_214102.png?ex=69c4d658&is=69c384d8&hm=969dea869c65a65474605b260c883f6ec8356192ae64435048b4b0e1feac9c4c&",
    backImage: "https://cdn.discordapp.com/attachments/1468086865629286545/1486255013524410449/Screenshot_2026-03-07_214138.png?ex=69c4d658&is=69c384d8&hm=d2a3b7d8de4ed9a80996e4b8d541aaa9a953953e2590e619a023a51300d6b1dd&",
  },
  {
    id: 2,
    name: "Clubmax 10 FB4",
    description: "Compact yet powerful laser fixture with full FB4 integration. Perfect for club installations.",
    frontImage: "https://cdn.discordapp.com/attachments/1468086865629286545/1486255133221453996/Screenshot_2026-03-03_225902.png?ex=69c4d675&is=69c384f5&hm=f550f72066773a0fea9444dfd344000a4c569f62d3efc643f4e8cfb40d240378&",
    backImage: "https://cdn.discordapp.com/attachments/1468086865629286545/1486255133909188648/Screenshot_2026-03-03_225918.png?ex=69c4d675&is=69c384f5&hm=b6beffac4ccc07ee2be4a7b927bc5970ac9a7cd653be3abbc530aea696f48b97&",
  },
  {
    id: 3,
    name: "Showven UFlamer",
    description: "Stunning flame effect system for dramatic stage presentations. Commission-only availability.",
    frontImage: "https://cdn.discordapp.com/attachments/1468086865629286545/1486255321717411900/Screenshot_2026-02-28_105705.png?ex=69c4d6a1&is=69c38521&hm=eccc61952fb7a04d908f5296fd14737b3e28c72599d22c5e55f8a717f9226a8b&",
    backImage: "https://cdn.discordapp.com/attachments/1468086865629286545/1486255322082443435/Screenshot_2026-02-28_105720.png?ex=69c4d6a2&is=69c38522&hm=cc44ea8e5c8abad68ca8e758aa197ade973d9b184815cf09b1716b3f5595c003&",
  },
  {
    id: 4,
    name: "Salamander Quad Pro",
    description: "Four-head effect system creating mesmerizing patterns. Bespoke commissions available.",
    frontImage: "https://cdn.discordapp.com/attachments/1468086865629286545/1486255433361395735/Screenshot_2026-02-24_184403.png?ex=69c4d6bc&is=69c3853c&hm=3549d9c39244efdbdb95c3cd6b65ebe1d95c5d884f012c8b013950aac1a4fdd9&",
    backImage: "https://cdn.discordapp.com/attachments/1468086865629286545/1486255433869033472/Screenshot_2026-02-24_184446.png?ex=69c4d6bc&is=69c3853c&hm=b19a049041df867345899b584daebc4a0c176a9acd2789f13bf1da9c9035bf31&",
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

export function CommissionsSection() {
  return (
    <section id="commissions" className="py-20 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full mb-6">
            <Palette className="h-4 w-4" />
            <span className="text-sm font-medium">Custom Work</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Commissions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Need something custom? We create bespoke fixtures tailored to your exact specifications. 
            Join our Discord to discuss your project.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {commissions.map((commission) => (
            <motion.div
              key={commission.id}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-lg border border-border bg-card cursor-pointer"
            >
              {/* Image Container with Front/Back */}
              <div className="relative aspect-[4/3] overflow-hidden">
                {/* Front Image */}
                <img
                  src={commission.frontImage}
                  alt={commission.name}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-100 group-hover:opacity-0"
                />
                {/* Back Image */}
                <img
                  src={commission.backImage}
                  alt={`${commission.name} - Back`}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                />
                
                {/* Commission Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 text-black rounded-full text-xs font-semibold">
                  COMMISSION
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-base font-semibold mb-2 group-hover:text-muted-foreground transition-colors duration-300">
                  {commission.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {commission.description}
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
            href="https://discord.gg/YrsyVzxk8H"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background font-semibold rounded-md hover:bg-foreground/90 transition-colors duration-300"
          >
            Request a Commission
            <ArrowUpRight className="h-5 w-5" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
