import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/firebase'
import type { TempCart, CartItem } from '@/types'

// POST /api/cart - Save cart to Firebase (auth required)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { products, robloxUserId } = body as {
      products: CartItem[]
      robloxUserId: string
    }

    if (!robloxUserId) {
      return NextResponse.json({ error: 'Roblox user ID is required' }, { status: 400 })
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Cart must contain at least one product' }, { status: 400 })
    }

    const now = Date.now()
    const cart: TempCart = {
      robloxUserId,
      discordId: session.user.discordId,
      products,
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours from now
    }

    await db.ref(`tempCarts/${robloxUserId}`).set(cart)

    return NextResponse.json({ success: true, expiresAt: cart.expiresAt })
  } catch (error) {
    console.error('Error saving cart:', error)
    return NextResponse.json({ error: 'Failed to save cart' }, { status: 500 })
  }
}

// GET /api/cart - Fetch user's current cart (auth required)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to get robloxUserId from session first
    let robloxUserId = session.user.robloxUserId

    // If not in session, look up from userLinks
    if (!robloxUserId) {
      const linkSnapshot = await db.ref(`userLinks/${session.user.discordId}`).once('value')
      const linkData = linkSnapshot.val()
      if (linkData) {
        robloxUserId = linkData.robloxUserId as string
      }
    }

    if (!robloxUserId) {
      return NextResponse.json({ cart: null, error: 'No linked Roblox account found' })
    }

    const snapshot = await db.ref(`tempCarts/${robloxUserId}`).once('value')
    const data = snapshot.val()

    if (!data) {
      return NextResponse.json({ cart: null })
    }

    const cart = data as TempCart

    // Check if cart is expired
    if (Date.now() > cart.expiresAt) {
      // Clean up expired cart
      await db.ref(`tempCarts/${robloxUserId}`).remove()
      return NextResponse.json({ cart: null })
    }

    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}
