"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Factory, Palette, Wrench } from "lucide-react"

const services = [
  { icon: Factory, title: "Model Creation", description: "High-quality working models crafted with precision. From concept to finished product, built to perform." },
  { icon: Palette, title: "Custom Commissions", description: "Bespoke creations tailored to your exact specifications with meticulous attention to detail." },
  { icon: Wrench, title: "Technical Support", description: "Dedicated after-sales support ensuring your products perform optimally." },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-20 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">What We Offer</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Comprehensive solutions designed to exceed expectations.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.title} className="group p-6 sm:p-8 border border-border rounded-lg bg-card hover:bg-foreground hover:text-background transition-all duration-300 cursor-default">
              <div className="mb-4"><service.icon className="h-10 w-10 group-hover:scale-110 transition-transform duration-300" /></div>
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-muted-foreground group-hover:text-background/80 transition-colors">{service.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
