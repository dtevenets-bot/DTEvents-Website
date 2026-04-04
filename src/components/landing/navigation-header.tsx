'use client';

import { useEffect, useState, useRef } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/auth/user-menu';
import { Button } from '@/components/ui/button';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface NavigationHeaderProps {
  onNavigate?: (section: string) => void;
}

export function NavigationHeader({ onNavigate }: NavigationHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    heroRef.current = document.getElementById('hero-section') as HTMLElement;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-60px 0px 0px 0px' }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
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
          : 'bg-transparent border-transparent header-on-hero'
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
          {['services', 'products', 'commissions'].map((section) => (
            <Button
              key={section}
              variant="ghost"
              className={`transition-colors ${
                scrolled
                  ? 'hover:bg-tint hover:text-tint-fg'
                  : 'hover:bg-white/10'
              }`}
              onClick={() => scrollToSection(section)}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </Button>
          ))}
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
                : 'hover:bg-white/10'
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
