import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/firebase'
import type { UserLink } from '@/types'

// GET /api/user/profile - Get user's full profile (auth required)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const discordId = session.user.discordId

    // Fetch user link from Firebase to get robloxUserId
    let userLink: UserLink | null = null
    const linkSnapshot = await db.ref(`userLinks/${discordId}`).once('value')
    const linkData = linkSnapshot.val()
    if (linkData) {
      userLink = linkData as UserLink
    }

    // Fetch owned product count (non-revoked only)
    let ownedProductCount = 0
    const productsSnapshot = await db.ref(`userProducts/${discordId}`).once('value')
    const productsData = productsSnapshot.val()
    if (productsData) {
      ownedProductCount = Object.values(productsData).filter(
        (p: Record<string, unknown>) => !p.revoked
      ).length
    }

    const profile = {
      // Session info
      discordId,
      username: session.user.name,
      avatar: session.user.image,
      role: session.user.role,
      robloxUserId: session.user.robloxUserId || userLink?.robloxUserId || null,

      // Linked account info
      linked: !!userLink,
      linkedAt: userLink?.linkedAt || null,

      // Stats
      ownedProductCount,
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}
