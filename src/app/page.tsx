"use client"

import { NavigationHeader } from "@/components/navigation-header"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { ProductsSection } from "@/components/products-section"
import { CommissionsSection } from "@/components/commissions-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <NavigationHeader />
      
      <div className="flex-1">
        <HeroSection />
        <ServicesSection />
        <ProductsSection />
        <CommissionsSection />
      </div>
      
      <Footer />
    </main>
  )
}
