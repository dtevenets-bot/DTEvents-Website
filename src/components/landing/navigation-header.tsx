'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/auth/user-menu';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface NavigationHeaderProps {
  onNavigate?: (section: string) => void;
}

export function NavigationHeader({ onNavigate }: NavigationHeaderProps) {
  const scrollToSection = (section: string) => {
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    onNavigate?.(section);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 font-bold text-lg hover:bg-foreground hover:text-background px-3 py-1.5 rounded-md transition-colors"
        >
          DT Events
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost"
            className="hover:bg-foreground hover:text-background"
            onClick={() => scrollToSection('services')}
          >
            Services
          </Button>
          <Button
            variant="ghost"
            className="hover:bg-foreground hover:text-background"
            onClick={() => scrollToSection('products')}
          >
            Products
          </Button>
          <Button
            variant="ghost"
            className="hover:bg-foreground hover:text-background"
            onClick={() => scrollToSection('commissions')}
          >
            Commissions
          </Button>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-foreground hover:text-background"
            onClick={() => scrollToSection('services')}
          >
            <Menu className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
