'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { ShoppingCart, Package, ShoppingBag, Zap, Shield, Settings, Menu } from 'lucide-react';
import { useState } from 'react';

export type HubTab = 'products' | 'my-products' | 'booster' | 'admin' | 'manage';

interface HubNavigationProps {
  activeTab: HubTab;
  onTabChange: (tab: HubTab) => void;
}

const tabs = [
  { id: 'products' as HubTab, label: 'Products', icon: Package },
  { id: 'my-products' as HubTab, label: 'My Products', icon: ShoppingBag },
  { id: 'booster' as HubTab, label: 'Booster Zone', icon: Zap, minRole: 'booster' },
  { id: 'admin' as HubTab, label: 'Admin', icon: Shield, minRole: 'admin' },
  { id: 'manage' as HubTab, label: 'Manage Products', icon: Settings, minRole: 'owner' },
];

export function HubNavigation({ activeTab, onTabChange }: HubNavigationProps) {
  const { isBooster, isAdmin, isOwner } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount());
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleTabs = tabs.filter((tab) => {
    if (tab.minRole === 'booster') return isBooster();
    if (tab.minRole === 'admin') return isAdmin();
    if (tab.minRole === 'owner') return isOwner();
    return true;
  });

  return (
    <div className="border-b bg-background sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-1">
          <span className="font-bold text-lg mr-4 hidden sm:block">DT Events</span>

          {/* Desktop tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleTabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                className={`gap-1.5 ${activeTab === tab.id ? 'bg-foreground text-background hover:bg-foreground/90 hover:text-background' : 'hover:bg-foreground hover:text-background'}`}
                onClick={() => onTabChange(tab.id)}
              >
                <tab.icon className="size-3.5" />
                {tab.label}
              </Button>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-foreground hover:text-background">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 py-2">
                {visibleTabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                    className={`justify-start gap-2 ${activeTab === tab.id ? 'bg-foreground text-background hover:bg-foreground/90 hover:text-background' : 'hover:bg-foreground hover:text-background'}`}
                    onClick={() => {
                      onTabChange(tab.id);
                      setMobileOpen(false);
                    }}
                  >
                    <tab.icon className="size-4" />
                    {tab.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Cart icon */}
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-foreground hover:text-background"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-cart'));
          }}
        >
          <ShoppingCart className="size-4" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 size-4 bg-foreground text-background rounded-full text-[10px] flex items-center justify-center font-bold">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
