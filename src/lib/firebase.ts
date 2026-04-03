import admin from 'firebase-admin';
import type { Product, UserProduct } from '@/types';

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

// Lazy getter — Firebase only initializes on first actual use at runtime,
// not at import time. This prevents build failures on Vercel where env
// vars are not available during static prerendering.
export const db = new Proxy({} as admin.database.Database, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

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
