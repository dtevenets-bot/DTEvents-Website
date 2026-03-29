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
// POST /api/admin/revoke - Revoke a product from a user (admin+)
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
    const { userProductId } = body;

    if (!userProductId) {
      return NextResponse.json(
        { error: 'userProductId is required.' },
        { status: 400 }
      );
    }

    // Verify the user product exists and is not already revoked
    const snapshot = await db.ref(`userProducts/${userProductId}`).once('value');

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: 'User product record not found.' },
        { status: 404 }
      );
    }

    const existingData = snapshot.val() as Record<string, unknown>;

    if (existingData.revokedAt !== null && existingData.revokedAt !== undefined) {
      return NextResponse.json(
        { error: 'Product has already been revoked.' },
        { status: 400 }
      );
    }

    const productName = (existingData.productName as string) || 'Unknown';
    const targetUserId = (existingData.userId as string) || 'Unknown';
    const targetProductId = (existingData.productId as string) || '';

    // Get product info for context
    let productInfo = productName;
    if (targetProductId) {
      const productSnapshot = await db.ref(`products/${targetProductId}`).once('value');
      if (productSnapshot.exists()) {
        const product = parseProduct(targetProductId, productSnapshot.val() as Record<string, unknown>);
        productInfo = product.name;
      }
    }

    // Soft-revoke by setting revokedAt and revokedBy
    await db.ref(`userProducts/${userProductId}`).update({
      revokedAt: Date.now(),
      revokedBy: session.user.discordId,
    });

    // Create audit log
    const auditRef = db.ref('auditLogs').push();
    const auditLog: Omit<AuditLog, 'id'> = {
      action: 'revoke',
      performedBy: session.user.discordId,
      performedByRole: session.user.role,
      targetUserId,
      targetProductId,
      details: `Revoked product "${productInfo}" (${targetProductId}) from user ${targetUserId}. User product ID: ${userProductId}`,
      createdAt: Date.now(),
    };
    await auditRef.set(auditLog);

    return NextResponse.json({
      message: `Product "${productInfo}" has been revoked from user ${targetUserId}.`,
      userProductId,
    });
  } catch (error) {
    console.error('[POST /api/admin/revoke] Error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke product.' },
      { status: 500 }
    );
  }
}
