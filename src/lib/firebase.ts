import admin from 'firebase-admin';
import type { Product, UserProduct } from '@/types';

// ============================================================
// Environment Validation
// ============================================================

const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_DATABASE_URL',
] as const;

function validateEnv(): void {
  const missing = requiredEnvVars.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missing.join(', ')}`
    );
  }
}

// ============================================================
// Firebase Admin Init (singleton)
// ============================================================

let _db: admin.database.Database | null = null;

function getDb(): admin.database.Database {
  if (_db) return _db;

  validateEnv();

  const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n');

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL!,
    });
  }

  _db = admin.database();
  return _db;
}

export const db = getDb();

// ============================================================
// Helper Functions
// ============================================================

/**
 * Parse a raw Firebase snapshot value into a Product.
 * Ensures all fields have sensible defaults.
 */
export function parseProduct(
  id: string,
  data: Record<string, unknown>
): Product {
  return {
    id,
    name: (data.name as string) || 'Unknown Product',
    description: (data.description as string) || '',
    price: typeof data.price === 'number' ? data.price : 0,
    gamepassId:
      typeof data.gamepassId === 'number' ? data.gamepassId : null,
    active: data.active !== false,
    createdAt: data.createdAt ?? Date.now(),
    createdBy: (data.createdBy as string) || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    type: (data.type as Product['type']) || 'other',
    images: {
      front:
        (data.images as Record<string, unknown>)?.front?.toString() || '',
      back:
        (data.images as Record<string, unknown>)?.back?.toString() || '',
    },
    maker: (data.maker as string) || '',
    boosterExclusive: data.boosterExclusive === true,
  };
}

/**
 * Parse a raw Firebase snapshot value into a UserProduct.
 */
export function parseUserProduct(
  id: string,
  data: Record<string, unknown>
): UserProduct {
  return {
    id,
    userId: (data.userId as string) || '',
    productId: (data.productId as string) || '',
    productName: (data.productName as string) || '',
    grantedBy: (data.grantedBy as string) || '',
    grantedAt: data.grantedAt ?? Date.now(),
    revokedAt: data.revokedAt ?? null,
    revokedBy: data.revokedBy ?? null,
  };
}
