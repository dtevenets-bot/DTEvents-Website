import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import type { CartItem, TempCart } from '@/types';

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
    const { items } = body as { items: CartItem[] };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required.' },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!item.productId || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
        return NextResponse.json(
          { error: 'Invalid cart item format.' },
          { status: 400 }
        );
      }
    }

    const now = Date.now();
    const tempCart: TempCart = {
      robloxUserId: session.user.robloxUserId,
      items,
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
    };

    await db
      .ref(`tempCarts/${session.user.robloxUserId}`)
      .set(tempCart);

    return NextResponse.json({
      message: 'Cart saved successfully.',
      expiresAt: tempCart.expiresAt,
    });
  } catch (error) {
    console.error('[POST /api/cart] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save cart.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.robloxUserId) {
      return NextResponse.json(
        { error: 'Authentication required with linked Roblox account.' },
        { status: 401 }
      );
    }

    const snapshot = await db
      .ref(`tempCarts/${session.user.robloxUserId}`)
      .once('value');

    if (!snapshot.exists()) {
      return NextResponse.json({ items: [] });
    }

    const cart = snapshot.val() as TempCart;

    if (Date.now() > cart.expiresAt) {
      await db
        .ref(`tempCarts/${session.user.robloxUserId}`)
        .remove();
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json({
      items: cart.items,
      createdAt: cart.createdAt,
      expiresAt: cart.expiresAt,
    });
  } catch (error) {
    console.error('[GET /api/cart] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart.' },
      { status: 500 }
    );
  }
}
