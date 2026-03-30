import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { parseProduct } from '@/lib/firebase';
import type { AuditLog } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const snapshot = await db.ref(`products/${id}`).once('value');

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = parseProduct(id, snapshot.val() as Record<string, unknown>);

    return NextResponse.json(product);
  } catch (error) {
    console.error(`[GET /api/products/${id}] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Unauthorized. Owner access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingSnapshot = await db.ref(`products/${id}`).once('value');
    if (!existingSnapshot.exists()) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      name,
      description,
      price,
      gamepassId,
      active,
      tags,
      type,
      images,
      maker,
      boosterExclusive,
    } = body;

    const updates: Record<string, unknown> = {};

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (gamepassId !== undefined) updates.gamepassId = gamepassId || null;
    if (active !== undefined) updates.active = active;
    if (tags !== undefined) updates.tags = tags;
    if (type !== undefined) updates.type = type;
    if (images !== undefined) updates.images = images;
    if (maker !== undefined) updates.maker = maker;
    if (boosterExclusive !== undefined) updates.boosterExclusive = boosterExclusive;

    await db.ref(`products/${id}`).update(updates);

    const auditRef = db.ref('auditLogs').push();
    const auditLog: Omit<AuditLog, 'id'> = {
      action: 'edit_product',
      performedBy: session.user.discordId,
      performedByRole: session.user.role,
      targetProductId: id,
      details: `Edited product "${name || id}" (ID: ${id}). Fields: ${Object.keys(updates).join(', ')}`,
      createdAt: Date.now(),
    };
    await auditRef.set(auditLog);

    const updatedSnapshot = await db.ref(`products/${id}`).once('value');
    const updatedProduct = parseProduct(id, updatedSnapshot.val() as Record<string, unknown>);

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(`[PUT /api/products/${id}] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Unauthorized. Owner access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingSnapshot = await db.ref(`products/${id}`).once('value');
    if (!existingSnapshot.exists()) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const existingData = existingSnapshot.val() as Record<string, unknown>;
    const productName = (existingData.name as string) || id;

    // Permanently delete the product from Firebase
    await db.ref(`products/${id}`).remove();

    // Remove the attached RBXM file if it exists
    try {
      await db.ref(`rbxmFiles/${id}`).remove();
    } catch (fileErr) {
      console.warn(`[DELETE /api/products/${id}] Failed to remove attached file:`, fileErr);
    }

    // Cascade: remove all userProducts entries for this product
    try {
      const userProductsSnapshot = await db.ref('userProducts').once('value');
      if (userProductsSnapshot.exists()) {
        const updates: Record<string, null> = {};
        const allUserProducts = userProductsSnapshot.val() as Record<string, Record<string, unknown>>;
        for (const [upId, data] of Object.entries(allUserProducts)) {
          if (data.productId === id) {
            updates[upId] = null;
          }
        }
        if (Object.keys(updates).length > 0) {
          await db.ref('userProducts').update(updates);
          console.log(`[DELETE /api/products/${id}] Removed ${Object.keys(updates).length} userProducts entries.`);
        }
      }
    } catch (upErr) {
      console.warn(`[DELETE /api/products/${id}] Failed to cascade delete userProducts:`, upErr);
    }

    // Cascade: remove product from all tempCarts
    try {
      const cartsSnapshot = await db.ref('tempCarts').once('value');
      if (cartsSnapshot.exists()) {
        const carts = cartsSnapshot.val() as Record<string, Record<string, unknown>>;
        for (const [userId, cart] of Object.entries(carts)) {
          const items = cart.items as Array<{ productId: string }> | undefined;
          if (items && Array.isArray(items)) {
            const hasProduct = items.some((item) => item.productId === id);
            if (hasProduct) {
              const filteredItems = items.filter((item) => item.productId !== id);
              if (filteredItems.length === 0) {
                await db.ref(`tempCarts/${userId}`).remove();
              } else {
                await db.ref(`tempCarts/${userId}/items`).set(filteredItems);
              }
            }
          }
        }
        console.log(`[DELETE /api/products/${id}] Cleaned up product from all tempCarts.`);
      }
    } catch (cartErr) {
      console.warn(`[DELETE /api/products/${id}] Failed to cascade delete from tempCarts:`, cartErr);
    }

    // Clear announcement if this was the announced product
    try {
      const announcedSnapshot = await db.ref('siteConfig/announcedProduct').once('value');
      if (announcedSnapshot.exists()) {
        const announced = announcedSnapshot.val() as Record<string, unknown>;
        if (announced.id === id) {
          await db.ref('siteConfig/announcedProduct').remove();
        }
      }
    } catch (announceErr) {
      console.warn(`[DELETE /api/products/${id}] Failed to clear announcedProduct:`, announceErr);
    }

    const auditRef = db.ref('auditLogs').push();
    const auditLog: Omit<AuditLog, 'id'> = {
      action: 'delete_product',
      performedBy: session.user.discordId,
      performedByRole: session.user.role,
      targetProductId: id,
      details: `Permanently deleted product "${productName}" (ID: ${id})`,
      createdAt: Date.now(),
    };
    await auditRef.set(auditLog);

    return NextResponse.json({
      message: `Product "${productName}" has been permanently deleted, including all user ownership records and cart entries.`,
      id,
    });
  } catch (error) {
    console.error(`[DELETE /api/products/${id}] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
