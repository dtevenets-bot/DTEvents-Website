import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { parseUserProduct } from '@/lib/firebase';
import type { UserProduct } from '@/types';

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
      .ref('userProducts')
      .orderByChild('userId')
      .equalTo(session.user.robloxUserId)
      .once('value');

    if (!snapshot.exists()) {
      return NextResponse.json([]);
    }

    const raw = snapshot.val() as Record<string, Record<string, unknown>>;

    const products: UserProduct[] = [];

    for (const [id, data] of Object.entries(raw)) {
      if (data.revokedAt !== null && data.revokedAt !== undefined) {
        continue;
      }
      products.push(parseUserProduct(id, data));
    }

    products.sort((a, b) => {
      const aTime = typeof a.grantedAt === 'number' ? a.grantedAt : new Date(a.grantedAt).getTime();
      const bTime = typeof b.grantedAt === 'number' ? b.grantedAt : new Date(b.grantedAt).getTime();
      return bTime - aTime;
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('[GET /api/user/products] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user products.' },
      { status: 500 }
    );
  }
}
