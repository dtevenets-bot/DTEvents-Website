import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { parseProduct } from '@/lib/firebase';
import type { AuditLog, UserRole } from '@/types';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 4,
  admin: 3,
  booster: 2,
  user: 1,
};

// ============================================================
// POST /api/admin/grant - Grant a product to a user (admin+)
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      !ROLE_HIERARCHY[session.user.role] ||
      ROLE_HIERARCHY[session.user.role] < ROLE_HIERARCHY['admin']
    ) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin or higher access required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, productId } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'userId and productId are required.' },
        { status: 400 }
      );
    }

    // Verify product exists and is active
    const productSnapshot = await db.ref(`products/${productId}`).once('value');
    if (!productSnapshot.exists()) {
      return NextResponse.json(
        { error: 'Product not found.' },
        { status: 404 }
      );
    }

    const product = parseProduct(productId, productSnapshot.val() as Record<string, unknown>);

    if (!product.active) {
      return NextResponse.json(
        { error: 'Product is not active.' },
        { status: 400 }
      );
    }

    // Check if user already owns this product (non-revoked)
    const existingSnapshot = await db
      .ref('userProducts')
      .orderByChild('userId')
      .equalTo(userId)
      .once('value');

    if (existingSnapshot.exists()) {
      const existingData = existingSnapshot.val() as Record<string, Record<string, unknown>>;
      const alreadyOwned = Object.values(existingData).some(
        (p) =>
          p.productId === productId &&
          (p.revokedAt === null || p.revokedAt === undefined)
      );

      if (alreadyOwned) {
        return NextResponse.json(
          { error: 'User already owns this product.' },
          { status: 409 }
        );
      }
    }

    // Grant the product
    const userProductRef = db.ref('userProducts').push();
    const userProductId = userProductRef.key!;

    await userProductRef.set({
      userId,
      productId,
      productName: product.name,
      grantedBy: session.user.discordId,
      grantedAt: Date.now(),
      revokedAt: null,
      revokedBy: null,
    });

    // Create audit log
    const auditRef = db.ref('auditLogs').push();
    const auditLog: Omit<AuditLog, 'id'> = {
      action: 'grant',
      performedBy: session.user.discordId,
      performedByRole: session.user.role,
      targetUserId: userId,
      targetProductId: productId,
      details: `Granted product "${product.name}" (${productId}) to user ${userId}`,
      createdAt: Date.now(),
    };
    await auditRef.set(auditLog);

    return NextResponse.json({
      message: `Product "${product.name}" granted to user ${userId}.`,
      userProductId,
    });
  } catch (error) {
    console.error('[POST /api/admin/grant] Error:', error);
    return NextResponse.json(
      { error: 'Failed to grant product.' },
      { status: 500 }
    );
  }
}
