import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { parseProduct } from '@/lib/firebase';
import type { AuditLog } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================================
// GET /api/products/[id] - Get a single product
// ============================================================

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

// ============================================================
// PUT /api/products/[id] - Update a product (owner only)
// ============================================================

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

    // Check product exists
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

    // Build update object with only provided fields
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

    // Create audit log
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

    // Return updated product
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

// ============================================================
// DELETE /api/products/[id] - Soft-delete a product (owner only)
// ============================================================

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

    // Check product exists
    const existingSnapshot = await db.ref(`products/${id}`).once('value');
    if (!existingSnapshot.exists()) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const existingData = existingSnapshot.val() as Record<string, unknown>;
    const productName = (existingData.name as string) || id;

    // Soft-delete: set active = false
    await db.ref(`products/${id}`).update({
      active: false,
      deletedAt: Date.now(),
      deletedBy: session.user.discordId,
    });

    // Clear announcedProduct if this product was the announced one
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

    // Create audit log
    const auditRef = db.ref('auditLogs').push();
    const auditLog: Omit<AuditLog, 'id'> = {
      action: 'delete_product',
      performedBy: session.user.discordId,
      performedByRole: session.user.role,
      targetProductId: id,
      details: `Soft-deleted product "${productName}" (ID: ${id})`,
      createdAt: Date.now(),
    };
    await auditRef.set(auditLog);

    return NextResponse.json({
      message: `Product "${productName}" has been deactivated.`,
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
