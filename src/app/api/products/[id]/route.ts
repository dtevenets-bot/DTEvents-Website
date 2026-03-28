import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db, parseProduct } from '@/lib/firebase'
import type { AuditLog } from '@/types'

// GET /api/products/[id] - Fetch a single product (public)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const snapshot = await db.ref(`products/${id}`).once('value')
    const data = snapshot.val()

    if (!data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const product = parseProduct(data as Record<string, unknown>)

    // For booster exclusive products, check access
    if (product.boosterExclusive) {
      const session = await getServerSession(authOptions)
      const isBooster =
        session?.user?.role === 'booster' ||
        session?.user?.role === 'admin' ||
        session?.user?.role === 'owner'
      if (!isBooster) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// PUT /api/products/[id] - Update a product (owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = session.user.role as string
    if (role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden: Owner access required' }, { status: 403 })
    }

    const { id } = await params

    // Check product exists
    const existingSnapshot = await db.ref(`products/${id}`).once('value')
    const existingData = existingSnapshot.val()
    if (!existingData) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, price, gamepassId, tags, type, images, maker, boosterExclusive, active } = body

    if (price !== undefined && price < 0) {
      return NextResponse.json({ error: 'Price cannot be negative' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
      updatedBy: session.user.discordId,
    }

    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (price !== undefined) updates.price = Number(price)
    if (gamepassId !== undefined) updates.gamepassId = String(gamepassId)
    if (tags !== undefined) updates.tags = tags
    if (type !== undefined) updates.type = type
    if (images !== undefined) {
      updates.images = {
        front: images.front || '',
        back: images.back || '',
      }
    }
    if (maker !== undefined) updates.maker = maker
    if (boosterExclusive !== undefined) updates.boosterExclusive = Boolean(boosterExclusive)
    if (active !== undefined) updates.active = Boolean(active)

    await db.ref(`products/${id}`).update(updates)

    // Add audit log
    const auditRef = db.ref('auditLogs').push()
    const auditLog: Omit<AuditLog, 'id'> = {
      action: 'product_update',
      actor: {
        discordId: session.user.discordId,
        username: session.user.name || 'Unknown',
      },
      target: {
        productId: id,
      },
      details: { changes: updates },
      timestamp: Date.now(),
    }
    await auditRef.set({ ...auditLog, id: auditRef.key! })

    // Fetch updated product and return
    const updatedSnapshot = await db.ref(`products/${id}`).once('value')
    const updatedData = updatedSnapshot.val()

    return NextResponse.json(parseProduct(updatedData as Record<string, unknown>))
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Delete a product (owner only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = session.user.role as string
    if (role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden: Owner access required' }, { status: 403 })
    }

    const { id } = await params

    // Check product exists
    const existingSnapshot = await db.ref(`products/${id}`).once('value')
    const existingData = existingSnapshot.val()
    if (!existingData) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Soft delete by marking inactive
    await db.ref(`products/${id}`).update({
      active: false,
      updatedAt: Date.now(),
      updatedBy: session.user.discordId,
    })

    // Add audit log
    const auditRef = db.ref('auditLogs').push()
    const auditLog: Omit<AuditLog, 'id'> = {
      action: 'product_delete',
      actor: {
        discordId: session.user.discordId,
        username: session.user.name || 'Unknown',
      },
      target: {
        productId: id,
      },
      details: {
        productName: existingData.name,
        price: existingData.price,
      },
      timestamp: Date.now(),
    }
    await auditRef.set({ ...auditLog, id: auditRef.key! })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
