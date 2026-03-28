import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db, parseProduct } from '@/lib/firebase'
import type { AuditLog } from '@/types'

// POST /api/admin/grant - Grant a product to a user (admin+ required)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = session.user.role as string
    if (role !== 'admin' && role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { targetDiscordId, productId, reason } = body as {
      targetDiscordId: string
      productId: string
      reason?: string
    }

    if (!targetDiscordId || !productId) {
      return NextResponse.json(
        { error: 'Missing required fields: targetDiscordId, productId' },
        { status: 400 }
      )
    }

    // Check product exists and is active
    const productSnapshot = await db.ref(`products/${productId}`).once('value')
    const productData = productSnapshot.val()
    if (!productData) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    if (!productData.active) {
      return NextResponse.json({ error: 'Product is not active' }, { status: 400 })
    }

    // Check if user already has this product (non-revoked)
    const existingProductSnapshot = await db
      .ref(`userProducts/${targetDiscordId}/${productId}`)
      .once('value')
    const existingProduct = existingProductSnapshot.val()
    if (existingProduct && !existingProduct.revoked) {
      return NextResponse.json(
        { error: 'User already owns this product' },
        { status: 409 }
      )
    }

    // If user had a revoked entry, remove it and create fresh
    if (existingProduct && existingProduct.revoked) {
      await db.ref(`userProducts/${targetDiscordId}/${productId}`).remove()
    }

    const now = Date.now()
    const userProductData = {
      discordId: targetDiscordId,
      productId,
      grantedAt: now,
      grantedBy: session.user.discordId,
      source: 'admin_grant' as const,
    }

    await db.ref(`userProducts/${targetDiscordId}/${productId}`).set(userProductData)

    // Add audit log
    const auditRef = db.ref('auditLogs').push()
    const product = parseProduct(productData as Record<string, unknown>)
    const auditLog: Omit<AuditLog, 'id'> = {
      action: 'product_grant',
      actor: {
        discordId: session.user.discordId,
        username: session.user.name || 'Unknown',
      },
      target: {
        discordId: targetDiscordId,
        productId,
      },
      details: {
        productName: product.name,
        reason: reason || null,
      },
      timestamp: now,
    }
    await auditRef.set({ ...auditLog, id: auditRef.key! })

    return NextResponse.json({
      success: true,
      granted: {
        discordId: targetDiscordId,
        productId,
        productName: product.name,
      },
    })
  } catch (error) {
    console.error('Error granting product:', error)
    return NextResponse.json({ error: 'Failed to grant product' }, { status: 500 })
  }
}
