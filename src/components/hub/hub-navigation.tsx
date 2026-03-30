'use client';

import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Separator,
} from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import {
  ShoppingCartIcon,
  CubeIcon,
  ShoppingBagIcon,
  BoltIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  Bars3Icon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export type HubTab = 'products' | 'my-products' | 'booster' | 'admin' | 'manage';

interface HubNavigationProps {
  activeTab: HubTab;
  onTabChange: (tab: HubTab) => void;
  onGoHome?: () => void;
}

const tabs = [
  { id: 'products' as HubTab, label: 'Products', icon: CubeIcon },
  { id: 'my-products' as HubTab, label: 'My Products', icon: ShoppingBagIcon },
  { id: 'booster' as HubTab, label: 'Booster Zone', icon: BoltIcon, minRole: 'booster' },
  { id: 'admin' as HubTab, label: 'Admin', icon: ShieldCheckIcon, minRole: 'admin' },
  { id: 'manage' as HubTab, label: 'Manage Products', icon: Cog6ToothIcon, minRole: 'owner' },
];

export function HubNavigation({ activeTab, onTabChange, onGoHome }: HubNavigationProps) {
  const { data: session } = useSession();
  const { user, isBooster, isAdmin, isOwner } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const displayName = user?.username || session?.user?.username || 'User';
  const displayAvatar = user?.avatar || session?.user?.avatar || '';
  const displayRole = user?.role || session?.user?.role || 'user';

  const visibleTabs = tabs.filter((tab) => {
    if (tab.minRole === 'booster') return isBooster();
    if (tab.minRole === 'admin') return isAdmin();
    if (tab.minRole === 'owner') return isOwner();
    return true;
  });

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="border-b bg-page sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-1">
          <img src="/logo.png" alt="DT Events" className="size-7 mr-2 hidden sm:block" />
          <span className="font-bold text-lg mr-3 hidden sm:block">DT Events</span>

          <nav className="hidden md:flex items-center gap-1">
            {visibleTabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                className={`gap-1.5 ${activeTab === tab.id ? 'bg-ink text-page hover:bg-ink/90 hover:text-page' : 'hover:bg-tint hover:text-tint-fg'}`}
                onClick={() => onTabChange(tab.id)}
              >
                <tab.icon className="size-3.5" />
                {tab.label}
              </Button>
            ))}
          </nav>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger>
              <button className="inline-flex items-center justify-center size-9 rounded-md hover:bg-tint hover:text-tint-fg transition-colors md:hidden">
                <Bars3Icon className="size-4" />
              </button>
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
                    className={`justify-start gap-2 ${activeTab === tab.id ? 'bg-ink text-page hover:bg-ink/90 hover:text-page' : 'hover:bg-tint hover:text-tint-fg'}`}
                    onClick={() => {
                      onTabChange(tab.id);
                      setMobileOpen(false);
                    }}
                  >
                    <tab.icon className="size-4" />
                    {tab.label}
                  </Button>
                ))}

                <Separator className="my-2" />

                <Button
                  variant="ghost"
                  className="justify-start gap-2 hover:bg-tint hover:text-tint-fg"
                  onClick={() => {
                    setMobileOpen(false);
                    onGoHome?.();
                  }}
                >
                  <HomeIcon className="size-4" />
                  Landing Page
                </Button>

                <Button
                  variant="ghost"
                  className="justify-start gap-2 text-err hover:text-err"
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                  disabled={signingOut}
                >
                  <ArrowRightOnRectangleIcon className="size-4" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex hover:bg-tint hover:text-tint-fg"
            onClick={onGoHome}
            title="Back to landing page"
          >
            <HomeIcon className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-tint hover:text-tint-fg"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-cart'));
            }}
          >
            <ShoppingCartIcon className="size-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 size-4 bg-ink text-page rounded-full text-[10px] flex items-center justify-center font-bold">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Button>

          <div className="hidden lg:flex items-center gap-2 px-2">
            <Avatar className="size-7">
              {displayAvatar && <AvatarImage src={displayAvatar} alt={displayName} />}
              <AvatarFallback className="text-xs">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-none">
              <span className="text-xs font-medium">{displayName}</span>
              <Badge variant="secondary" className="text-[9px] px-1 py-0 mt-0.5 w-fit capitalize">
                {displayRole}
              </Badge>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-err hover:text-white"
            onClick={handleSignOut}
            disabled={signingOut}
            title="Sign out"
          >
            <ArrowRightOnRectangleIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
