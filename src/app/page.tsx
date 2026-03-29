'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth-store';
import { LoginModal } from '@/components/auth/login-modal';
import { NavigationHeader } from '@/components/landing/navigation-header';
import { HeroSection } from '@/components/landing/hero-section';
import { ServicesSection } from '@/components/landing/services-section';
import { ProductsPreview } from '@/components/landing/products-preview';
import { CommissionsSection } from '@/components/landing/commissions-section';
import { Footer } from '@/components/landing/footer';
import { HubNavigation, type HubTab } from '@/components/hub/hub-navigation';
import { ProductGrid } from '@/components/hub/product-grid';
import { MyProductsView } from '@/components/hub/my-products-view';
import { BoosterZone } from '@/components/hub/booster-zone';
import { AdminPanel } from '@/components/hub/admin-panel';
import { OwnerPanel } from '@/components/hub/owner-panel';
import { CartSidebar } from '@/components/hub/cart-sidebar';
import { CheckoutModal } from '@/components/hub/checkout-modal';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-14 border-b flex items-center justify-between px-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    </div>
  );
}

function LandingView() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader />
      <HeroSection />
      <ServicesSection />
      <ProductsPreview />
      <CommissionsSection />
      <Footer />
      <LoginModal />
    </div>
  );
}

function HubView({ onGoHome }: { onGoHome: () => void }) {
  const [activeTab, setActiveTab] = useState<HubTab>('products');

  return (
    <div className="min-h-screen flex flex-col">
      <HubNavigation activeTab={activeTab} onTabChange={setActiveTab} onGoHome={onGoHome} />
      <main className="flex-1 container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'products' && <ProductGrid />}
            {activeTab === 'my-products' && <MyProductsView />}
            {activeTab === 'booster' && <BoosterZone />}
            {activeTab === 'admin' && <AdminPanel />}
            {activeTab === 'manage' && <OwnerPanel />}
          </motion.div>
        </AnimatePresence>
      </main>
      <CartSidebar />
      <CheckoutModal />
      <LoginModal />
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const { setAuth, setLoading, logout } = useAuthStore();

  const [userPickedLanding, setUserPickedLanding] = useState(false);

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (session?.user) {
      setAuth({
        id: session.user.id,
        discordId: session.user.discordId,
        username: session.user.username,
        avatar: session.user.avatar,
        role: session.user.role,
        robloxUserId: session.user.robloxUserId,
      });
    } else {
      logout();
    }
  }, [session, status, setAuth, setLoading, logout]);

  const showLanding = useMemo(() => {
    if (status === 'loading') return false;
    if (!session?.user) return true;
    return userPickedLanding;
  }, [session, status, userPickedLanding]);

  const handleGoHome = () => {
    setUserPickedLanding(true);
  };

  if (status === 'loading') {
    return <LoadingSkeleton />;
  }

  if (showLanding) {
    return <LandingView />;
  }

  return <HubView onGoHome={handleGoHome} />;
}
