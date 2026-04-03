'use client';

import { useSession, signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  UserIcon,
  CubeIcon,
  ShoppingBagIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/auth-store';
import type { HubTab } from '@/components/hub/hub-navigation';

export function UserMenu() {
  const { data: session } = useSession();
  const { user, isAdmin, isOwner, isAuthenticated } = useAuthStore();

  const handleLogin = () => {
    window.dispatchEvent(new CustomEvent('open-login'));
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const navigateToHub = (tab: HubTab) => {
    window.dispatchEvent(new CustomEvent('navigate-to-hub', { detail: { tab } }));
  };

  if (!session || !isAuthenticated) {
    return (
      <Button
        variant="ghost"
        className="hover:bg-tint hover:text-tint-fg"
        onClick={handleLogin}
      >
        <ArrowLeftOnRectangleIcon className="size-4 mr-2" />
        Login
      </Button>
    );
  }

  const displayName = user?.username || session.user?.username || 'User';
  const displayAvatar = user?.avatar || session.user?.avatar || '';
  const displayRole = user?.role || session.user?.role || 'user';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button className="inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-tint hover:text-tint-fg transition-colors">
          <Avatar className="size-6">
            {displayAvatar && <AvatarImage src={displayAvatar} alt={displayName} />}
            <AvatarFallback className="text-xs">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm">{displayName}</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {displayRole}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => navigateToHub('products')}>
          <CubeIcon className="size-4 mr-2" />
          Products
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigateToHub('my-products')}>
          <ShoppingBagIcon className="size-4 mr-2" />
          My Products
        </DropdownMenuItem>
        {isAdmin() && (
          <DropdownMenuItem onClick={() => navigateToHub('admin')}>
            <ShieldCheckIcon className="size-4 mr-2" />
            Admin
          </DropdownMenuItem>
        )}
        {isOwner() && (
          <DropdownMenuItem onClick={() => navigateToHub('manage')}>
            <Cog6ToothIcon className="size-4 mr-2" />
            Manage
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <ArrowRightOnRectangleIcon className="size-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
