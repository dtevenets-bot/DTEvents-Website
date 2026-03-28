import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db, parseProduct } from '@/lib/firebase'
import type { AuditLog } from '@/types'

// POST /api/admin/revoke - Revoke a product from a user (admin+ required)
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

    // Check user has the product and it's not already revoked
    const existingSnapshot = await db
      .ref(`userProducts/${targetDiscordId}/${productId}`)
      .once('value')
    const existingData = existingSnapshot.val()

    if (!existingData) {
      return NextResponse.json({ error: 'User does not own this product' }, { status: 404 })
    }

    if (existingData.revoked) {
      return NextResponse.json({ error: 'Product is already revoked' }, { status: 409 })
    }

    const now = Date.now()

    // Update with revoked flag
    await db.ref(`userProducts/${targetDiscordId}/${productId}`).update({
      revoked: true,
      revokedAt: now,
      revokedBy: session.user.discordId,
    })

    // Fetch product name for audit log
    let productName = 'Unknown'
    const productSnapshot = await db.ref(`products/${productId}`).once('value')
    const productData = productSnapshot.val()
    if (productData) {
      productName = productData.name
    }

    // Add audit log
    const auditRef = db.ref('auditLogs').push()
    const auditLog: Omit<AuditLog, 'id'> = {
      action: 'product_revoke',
      actor: {
        discordId: session.user.discordId,
        username: session.user.name || 'Unknown',
      },
      target: {
        discordId: targetDiscordId,
        productId,
      },
      details: {
        productName,
        reason: reason || null,
      },
      timestamp: now,
    }
    await auditRef.set({ ...auditLog, id: auditRef.key! })

    return NextResponse.json({
      success: true,
      revoked: {
        discordId: targetDiscordId,
        productId,
        productName,
      },
    })
  } catch (error) {
    console.error('Error revoking product:', error)
    return NextResponse.json({ error: 'Failed to revoke product' }, { status: 500 })
  }
}
