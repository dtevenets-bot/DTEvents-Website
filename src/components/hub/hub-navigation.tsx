"use client"

import * as React from "react"
import { useAuthStore, isBooster, isAdmin, isOwner } from "@/stores/auth-store"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/auth/user-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Menu, X } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { motion, AnimatePresence } from "framer-motion"

export type HubTab = "products" | "my-products" | "booster" | "admin" | "manage"

interface HubNavigationProps {
  activeTab: HubTab
  onTabChange: (tab: HubTab) => void
  onCartOpen: () => void
}

const allTabs: { id: HubTab; label: string; minRole: string }[] = [
  { id: "products", label: "Products", minRole: "user" },
  { id: "my-products", label: "My Products", minRole: "user" },
  { id: "booster", label: "Booster Zone", minRole: "booster" },
  { id: "admin", label: "Admin", minRole: "admin" },
  { id: "manage", label: "Manage Products", minRole: "owner" },
]

export function HubNavigation({ activeTab, onTabChange, onCartOpen }: HubNavigationProps) {
  const user = useAuthStore((s) => s.user)
  const role = user?.role
  const itemCount = useCartStore((s) => s.itemCount())
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const visibleTabs = allTabs.filter((tab) => {
    if (tab.minRole === "user") return true
    if (tab.minRole === "booster") return isBooster(role)
    if (tab.minRole === "admin") return isAdmin(role)
    if (tab.minRole === "owner") return isOwner(role)
    return false
  })

  const handleTabClick = (tabId: HubTab) => {
    onTabChange(tabId)
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              onTabChange("products")
            }}
            className="text-xl font-bold tracking-tight hover:opacity-70 transition-opacity"
          >
            DT Events
          </a>

          <div className="hidden md:flex items-center gap-1">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300 ${
                  activeTab === tab.id
                    ? "bg-foreground text-background"
                    : "hover:bg-foreground/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-foreground hover:text-background transition-colors duration-300"
              onClick={onCartOpen}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-foreground text-background rounded-full">
                  {itemCount > 99 ? "99+" : itemCount}
                </Badge>
              )}
              <span className="sr-only">Open cart</span>
            </Button>
            <div className="hidden sm:block">
              <UserMenu />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-foreground hover:text-background transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border overflow-hidden"
            >
              <div className="py-3 space-y-1">
                {visibleTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`block w-full text-left px-4 py-3 text-sm font-medium rounded-md transition-colors duration-300 ${
                      activeTab === tab.id
                        ? "bg-foreground text-background"
                        : "hover:bg-foreground/10"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                <div className="pt-2 px-4 sm:hidden">
                  <UserMenu />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
