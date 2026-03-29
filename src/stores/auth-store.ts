import { create } from 'zustand';
import type { UserSession, UserRole } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  user: UserSession | null;
  isLoading: boolean;
  setAuth: (user: UserSession | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  isOwner: () => boolean;
  isAdmin: () => boolean;
  isBooster: () => boolean;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 4,
  admin: 3,
  booster: 2,
  user: 1,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  setAuth: (user: UserSession | null) => {
    set({
      isAuthenticated: !!user,
      user,
      isLoading: false,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  },

  hasRole: (role: UserRole) => {
    const { user } = get();
    if (!user) return false;
    return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[role];
  },

  isOwner: () => get().hasRole('owner'),

  isAdmin: () => get().hasRole('admin'),

  isBooster: () => get().hasRole('booster'),
}));
