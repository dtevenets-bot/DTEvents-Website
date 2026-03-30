export type UserRole = 'owner' | 'admin' | 'booster' | 'user';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  globalName: string | null;
}

export interface UserSession {
  id: string;
  discordId: string;
  username: string;
  avatar: string;
  role: UserRole;
  robloxUserId: string | null;
}

export interface VerificationData {
  discordId: string;
  username: string;
  avatar: string;
  role: UserRole;
  robloxUserId: string;
  createdAt: number;
  expiresAt: number;
}

export type ProductTag = 'new' | 'popular' | 'limited' | 'sale' | 'featured' | 'exclusive';

export type ProductType = 'gamepass' | 'asset' | 'plugin' | 'tool' | 'other';

export interface ProductImages {
  front: string;
  back: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  gamepassId: number | null;
  active: boolean;
  createdAt: string | number;
  createdBy: string;
  tags: ProductTag[];
  type: ProductType;
  images: ProductImages;
  maker: string;
  boosterExclusive: boolean;
}

export interface ProductFilters {
  search?: string;
  tags?: ProductTag[];
  types?: ProductType[];
  priceMin?: number;
  priceMax?: number;
  boosterOnly?: boolean;
}

export interface UserLink {
  discordId: string;
  robloxUserId: string;
  linkedAt: string | number;
}

export interface UserProduct {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  grantedBy: string;
  grantedAt: string | number;
  revokedAt: string | number | null;
  revokedBy: string | null;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

export interface TempCart {
  robloxUserId: string;
  items: CartItem[];
  createdAt: string | number;
  expiresAt: string | number;
}

export interface AuditLog {
  id: string;
  action: 'grant' | 'revoke' | 'create_product' | 'edit_product' | 'delete_product' | 'announce_product' | 'upload_file' | 'delete_file';
  performedBy: string;
  performedByRole: UserRole;
  targetUserId?: string;
  targetProductId?: string;
  details: string;
  createdAt: string | number;
}
