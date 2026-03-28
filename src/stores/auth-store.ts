import { create } from 'zustand'
import { type UserRole, type UserSession } from '@/types'

interface AuthState {
  isAuthenticated: boolean
  user: UserSession | null
  isLoading: boolean
  setAuth: (user: UserSession | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  setAuth: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
}))

// Helper to check if user has at least the required role
const roleHierarchy: Record<UserRole, number> = {
  user: 0,
  booster: 1,
  admin: 2,
  owner: 3,
}

export function hasRole(userRole: UserRole | null | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false
  return (roleHierarchy[userRole] ?? 0) >= (roleHierarchy[requiredRole] ?? 0)
}

export function isOwner(role: UserRole | null | undefined): boolean {
  return role === 'owner'
}

export function isAdmin(role: UserRole | null | undefined): boolean {
  return role === 'admin' || role === 'owner'
}

export function isBooster(role: UserRole | null | undefined): boolean {
  return role === 'booster' || role === 'admin' || role === 'owner'
}
