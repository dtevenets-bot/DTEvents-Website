// ===== User & Auth Types =====

export type UserRole = 'user' | 'booster' | 'admin' | 'owner'

export interface DiscordUser {
  id: string
  username: string
  avatar: string | null
  discriminator: string
}

export interface UserSession {
  discordUser: DiscordUser
  role: UserRole
  robloxUserId: string | null
}

export interface VerificationData {
  discordId: string
  username: string
  avatar: string | null
  discriminator: string
  roles: string[]
  role: UserRole
  robloxUserId: string | null
  createdAt: number
  expiresAt: number
}

// ===== Product Types =====

export interface Product {
  id: string
  name: string
  description: string
  price: number
  gamepassId: string
  active: boolean
  createdAt: number
  createdBy: string
  updatedAt?: number
  updatedBy?: string
  // Extended fields
  tags: string[]
  type: string
  images: {
    front: string
    back: string
  }
  maker: string
  boosterExclusive: boolean
}

export type ProductTag = 'budget' | 'free' | 'flux_kit_ready' | 'new'

export type ProductType = 'profile' | 'venue' | 'wash' | 'other'

// ===== User Link Types =====

export interface UserLink {
  discordId: string
  robloxUserId: string
  linkedAt: number
  linkedBy: string
}

// ===== User Product Types =====

export interface UserProduct {
  discordId: string
  productId: string
  grantedAt: number
  grantedBy: string
  source: 'purchase' | 'admin_grant' | 'transfer'
  revoked?: boolean
  revokedAt?: number
  revokedBy?: string
}

// ===== Cart Types =====

export interface CartItem {
  productId: string
  productName: string
  productPrice: number
  quantity: number
}

export interface TempCart {
  robloxUserId: string
  discordId: string
  products: CartItem[]
  createdAt: number
  expiresAt: number
}

// ===== Audit Log Types =====

export interface AuditLog {
  id: string
  action: string
  actor: {
    discordId: string
    username: string
  }
  target?: {
    discordId?: string
    robloxUserId?: string
    productId?: string
  }
  details: Record<string, unknown>
  timestamp: number
}

// ===== Filter Types =====

export interface ProductFilters {
  search: string
  tags: string[]
  types: string[]
  priceMin: number | null
  priceMax: number | null
  boosterOnly: boolean
}
