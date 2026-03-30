import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import type { AuditLog } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.robloxUserId) {
      return NextResponse.json(
        { error: 'Authentication required with linked Roblox account.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { error: 'Product ID is required.' },
        { status: 400 }
      );
    }

    // Fetch the product
    const productSnapshot = await db.ref(`products/${productId}`).once('value');
    if (!productSnapshot.exists()) {
      return NextResponse.json(
        { error: 'Product not found.' },
        { status: 404 }
      );
    }

    const productData = productSnapshot.val() as Record<string, unknown>;
    const price = typeof productData.price === 'number' ? productData.price : 0;

    if (price !== 0) {
      return NextResponse.json(
        { error: 'This product is not free. Add it to your cart instead.' },
        { status: 400 }
      );
    }

    if (productData.active === false) {
      return NextResponse.json(
        { error: 'This product is no longer available.' },
        { status: 400 }
      );
    }

    // Check if user already owns it
    const existingSnapshot = await db
      .ref('userProducts')
      .orderByChild('userId')
      .equalTo(session.user.robloxUserId)
      .once('value');

    if (existingSnapshot.exists()) {
      const existing = existingSnapshot.val() as Record<string, Record<string, unknown>>;
      for (const [, data] of Object.entries(existing)) {
        if (
          data.productId === productId &&
          (data.revokedAt === null || data.revokedAt === undefined)
        ) {
          return NextResponse.json(
            { error: 'You already own this product.', alreadyOwned: true },
            { status: 409 }
          );
        }
      }
    }

    // Grant the product
    const productRef = db.ref('userProducts').push();
    await productRef.set({
      userId: session.user.robloxUserId,
      productId,
      productName: (productData.name as string) || 'Unknown',
      grantedBy: 'Website:FreeClaim',
      grantedAt: Date.now(),
      revokedAt: null,
      revokedBy: null,
    });

    // Audit log
    const auditRef = db.ref('auditLogs').push();
    const auditLog: Omit<AuditLog, 'id'> = {
      action: 'grant',
      performedBy: session.user.discordId,
      performedByRole: session.user.role,
      targetUserId: session.user.robloxUserId,
      targetProductId: productId,
      details: `Free claim: "${(productData.name as string) || productId}" (ID: ${productId})`,
      createdAt: Date.now(),
    };
    await auditRef.set(auditLog);

    return NextResponse.json({
      message: 'Product claimed successfully!',
      productId,
      productName: productData.name || 'Unknown',
    });
  } catch (error) {
    console.error('[POST /api/products/claim] Error:', error);
    return NextResponse.json(
      { error: 'Failed to claim product.' },
      { status: 500 }
    );
  }
}
