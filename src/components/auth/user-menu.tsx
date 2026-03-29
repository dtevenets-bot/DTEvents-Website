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
  User,
  Package,
  ShoppingBag,
  Shield,
  Settings,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export function UserMenu() {
  const { data: session } = useSession();
  const { user, isAdmin, isOwner, isAuthenticated } = useAuthStore();

  const handleLogin = () => {
    window.dispatchEvent(new CustomEvent('open-login'));
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (!session || !isAuthenticated) {
    return (
      <Button
        variant="ghost"
        className="hover:bg-foreground hover:text-background"
        onClick={handleLogin}
      >
        <LogIn className="size-4 mr-2" />
        Login
      </Button>
    );
  }

  const displayName = user?.username || session.user?.username || 'User';
  const displayAvatar = user?.avatar || session.user?.avatar || '';
  const displayRole = user?.role || session.user?.role || 'user';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 hover:bg-foreground hover:text-background">
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
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem>
          <User className="size-4 mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Package className="size-4 mr-2" />
          Products
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ShoppingBag className="size-4 mr-2" />
          My Products
        </DropdownMenuItem>
        {isAdmin() && (
          <DropdownMenuItem>
            <Shield className="size-4 mr-2" />
            Admin
          </DropdownMenuItem>
        )}
        {isOwner() && (
          <DropdownMenuItem>
            <Settings className="size-4 mr-2" />
            Manage
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="size-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
