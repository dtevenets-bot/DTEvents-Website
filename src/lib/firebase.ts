import * as admin from 'firebase-admin'

// Initialize Firebase Admin SDK (server-side only)
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  })
}

export const db = admin.database()

// ===== Type helpers =====

export function parseProduct(data: Record<string, unknown>): import('@/types').Product {
  return {
    id: data.id as string,
    name: data.name as string,
    description: data.description as string,
    price: data.price as number,
    gamepassId: data.gamepassId as string,
    active: data.active as boolean,
    createdAt: data.createdAt as number,
    createdBy: data.createdBy as string,
    updatedAt: data.updatedAt as number | undefined,
    updatedBy: data.updatedBy as string | undefined,
    tags: (data.tags as string[]) ?? [],
    type: (data.type as string) ?? 'other',
    images: {
      front: (data.images as Record<string, string>)?.front ?? '',
      back: (data.images as Record<string, string>)?.back ?? '',
    },
    maker: (data.maker as string) ?? '',
    boosterExclusive: (data.boosterExclusive as boolean) ?? false,
  }
}

export function parseUserProduct(data: Record<string, unknown>): import('@/types').UserProduct {
  return {
    discordId: data.discordId as string,
    productId: data.productId as string,
    grantedAt: data.grantedAt as number,
    grantedBy: data.grantedBy as string,
    source: data.source as 'purchase' | 'admin_grant' | 'transfer',
    revoked: data.revoked as boolean | undefined,
    revokedAt: data.revokedAt as number | undefined,
    revokedBy: data.revokedBy as string | undefined,
  }
}
