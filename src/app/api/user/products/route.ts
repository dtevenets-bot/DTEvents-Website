import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db, parseProduct, parseUserProduct } from '@/lib/firebase'
import type { UserProduct, Product } from '@/types'

// GET /api/user/products - Get user's owned products (auth required)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeRevoked = searchParams.get('includeRevoked') === 'true'

    const discordId = session.user.discordId

    const snapshot = await db.ref(`userProducts/${discordId}`).once('value')
    const data = snapshot.val()

    if (!data) {
      return NextResponse.json([])
    }

    let userProducts: UserProduct[] = Object.values(data).map(
      (p) => parseUserProduct(p as Record<string, unknown>)
    )

    // Filter out revoked unless requested
    if (!includeRevoked) {
      userProducts = userProducts.filter((p) => !p.revoked)
    }

    // Fetch full product details for each owned product
    const results: { userProduct: UserProduct; product: Product | null }[] = []

    for (const userProduct of userProducts) {
      const productSnapshot = await db.ref(`products/${userProduct.productId}`).once('value')
      const productData = productSnapshot.val()

      if (productData) {
        results.push({
          userProduct,
          product: parseProduct(productData as Record<string, unknown>),
        })
      } else {
        results.push({
          userProduct,
          product: null,
        })
      }
    }

    // Sort by most recently granted first
    results.sort((a, b) => b.userProduct.grantedAt - a.userProduct.grantedAt)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error fetching user products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
