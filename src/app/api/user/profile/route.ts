import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      );
    }

    let robloxUserId: string | null = session.user.robloxUserId;
    let robloxLinkedAt: string | number | null = null;

    if (session.user.discordId) {
      const linkSnapshot = await db
        .ref(`userLinks/${session.user.discordId}`)
        .once('value');

      if (linkSnapshot.exists()) {
        const linkData = linkSnapshot.val() as Record<string, unknown>;
        robloxUserId = (linkData.robloxUserId as string) || robloxUserId;
        robloxLinkedAt = linkData.linkedAt ?? null;
      }
    }

    let productCount = 0;
    if (robloxUserId) {
      const productsSnapshot = await db
        .ref('userProducts')
        .orderByChild('userId')
        .equalTo(robloxUserId)
        .once('value');

      if (productsSnapshot.exists()) {
        const data = productsSnapshot.val() as Record<string, Record<string, unknown>>;
        productCount = Object.values(data).filter(
          (p) => p.revokedAt === null || p.revokedAt === undefined
        ).length;
      }
    }

    return NextResponse.json({
      discordId: session.user.discordId,
      username: session.user.username,
      avatar: session.user.avatar,
      role: session.user.role,
      robloxUserId,
      robloxLinkedAt,
      productCount,
    });
  } catch (error) {
    console.error('[GET /api/user/profile] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile.' },
      { status: 500 }
    );
  }
}
