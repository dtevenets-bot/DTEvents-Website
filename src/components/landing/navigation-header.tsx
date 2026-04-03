'use client';

import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/auth/user-menu';
import { Button } from '@/components/ui/button';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface NavigationHeaderProps {
  onNavigate?: (section: string) => void;
}

export function NavigationHeader({ onNavigate }: NavigationHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (section: string) => {
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    onNavigate?.(section);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-page/80 backdrop-blur-sm border-b border-edge shadow-sm'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`flex items-center gap-2 font-bold text-lg px-3 py-1.5 rounded-md transition-colors ${
            scrolled
              ? 'hover:bg-tint hover:text-tint-fg'
              : 'text-white hover:bg-white/10'
          }`}
        >
          <img src="/logo.png" alt="DT Events" className="size-7" />
          DT Events
        </button>

        <nav className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost"
            className={`transition-colors ${
              scrolled
                ? 'hover:bg-tint hover:text-tint-fg'
                : 'text-white hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => scrollToSection('services')}
          >
            Services
          </Button>
          <Button
            variant="ghost"
            className={`transition-colors ${
              scrolled
                ? 'hover:bg-tint hover:text-tint-fg'
                : 'text-white hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => scrollToSection('products')}
          >
            Products
          </Button>
          <Button
            variant="ghost"
            className={`transition-colors ${
              scrolled
                ? 'hover:bg-tint hover:text-tint-fg'
                : 'text-white hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => scrollToSection('commissions')}
          >
            Commissions
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
          <Button
            variant="ghost"
            size="icon"
            className={`md:hidden transition-colors ${
              scrolled
                ? 'hover:bg-tint hover:text-tint-fg'
                : 'text-white hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => scrollToSection('services')}
          >
            <Bars3Icon className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
