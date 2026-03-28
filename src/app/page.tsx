"use client"

import * as React from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore, hasRole, isBooster, isAdmin, isOwner } from "@/stores/auth-store"
import { useCartStore } from "@/stores/cart-store"
import { type UserSession, type Product, type UserRole } from "@/types"

// Landing page components
import { NavigationHeader } from "@/components/landing/navigation-header"
import { HeroSection } from "@/components/landing/hero-section"
import { ServicesSection } from "@/components/landing/services-section"
import { ProductsPreview } from "@/components/landing/products-preview"
import { CommissionsSection } from "@/components/landing/commissions-section"
import { LandingFooter } from "@/components/landing/footer"

// Auth components
import { LoginModal } from "@/components/auth/login-modal"
import { UserMenu } from "@/components/auth/user-menu"

// Hub components
import { HubNavigation, type HubTab } from "@/components/hub/hub-navigation"
import { ProductGrid } from "@/components/hub/product-grid"
import { ProductDetailModal } from "@/components/hub/product-detail-modal"
import { CartSidebar } from "@/components/hub/cart-sidebar"
import { CheckoutModal } from "@/components/hub/checkout-modal"
import { MyProductsView } from "@/components/hub/my-products-view"
import { BoosterZone } from "@/components/hub/booster-zone"
import { AdminPanel } from "@/components/hub/admin-panel"
import { OwnerPanel } from "@/components/hub/owner-panel"

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-16 border-b border-border" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    </div>
  )
}

function LandingView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <NavigationHeader />
      <HeroSection />
      <ServicesSection />
      <ProductsPreview />
      <CommissionsSection />
      <LandingFooter />
      <LoginModal />
    </motion.div>
  )
}

function HubView() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role
  const cartItems = useCartStore((s) => s.items)
  const [activeTab, setActiveTab] = React.useState<HubTab>("products")
  const [cartOpen, setCartOpen] = React.useState(false)
  const [checkoutOpen, setCheckoutOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  // Listen for hub navigation events from UserMenu
  React.useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      const tab = customEvent.detail as HubTab
      if (tab) setActiveTab(tab)
    }
    window.addEventListener("hub-navigate", handler)
    return () => window.removeEventListener("hub-navigate", handler)
  }, [])

  // Reset tab if role doesn't support it
  React.useEffect(() => {
    if (activeTab === "booster" && !isBooster(role)) setActiveTab("products")
    if (activeTab === "admin" && !isAdmin(role)) setActiveTab("products")
    if (activeTab === "manage" && !isOwner(role)) setActiveTab("products")
  }, [role, activeTab])

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setDetailOpen(true)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "products":
        return <ProductGrid onProductClick={handleProductClick} />
      case "my-products":
        return <MyProductsView />
      case "booster":
        return <BoosterZone onProductClick={handleProductClick} />
      case "admin":
        return <AdminPanel />
      case "manage":
        return <OwnerPanel />
      default:
        return <ProductGrid onProductClick={handleProductClick} />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col"
    >
      <HubNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCartOpen={() => setCartOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground text-center">
            © 2026 DT Events. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Modals & Sidebars */}
      <ProductDetailModal
        product={selectedProduct}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
      <CartSidebar
        open={cartOpen}
        onOpenChange={setCartOpen}
        onCheckout={() => {
          setCartOpen(false)
          setCheckoutOpen(true)
        }}
      />
      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </motion.div>
  )
}

export default function Home() {
  const { data: session, status } = useSession()
  const { setAuth, logout } = useAuthStore()

  // Sync session to auth store
  React.useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userData = session.user as any
      const userSession: UserSession = {
        discordUser: {
          id: userData.discordId ?? userData.id ?? "",
          username: userData.username ?? userData.name ?? "User",
          avatar: userData.avatar ?? userData.image ?? null,
          discriminator: userData.discriminator ?? "0",
        },
        role: (userData.role ?? "user") as UserRole,
        robloxUserId: userData.robloxUserId ?? null,
      }
      setAuth(userSession)
    } else if (status === "unauthenticated") {
      logout()
    }
  }, [session, status, setAuth, logout])

  // Show loading while session is being fetched
  if (status === "loading") {
    return <LoadingScreen />
  }

  // Not authenticated → Landing page
  if (status === "unauthenticated") {
    return <LandingView />
  }

  // Authenticated → Product Hub
  return <HubView />
}
