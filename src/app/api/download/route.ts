import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.robloxUserId) {
      return NextResponse.json(
        { error: 'Authentication required with linked Roblox account.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'No product ID provided.' },
        { status: 400 }
      );
    }

    // Check if file exists
    const fileSnapshot = await db.ref(`rbxmFiles/${productId}`).once('value');
    if (!fileSnapshot.exists()) {
      return NextResponse.json(
        { error: 'No file available for this product.' },
        { status: 404 }
      );
    }

    const fileData = fileSnapshot.val() as Record<string, unknown>;
    const base64Data = fileData.base64Data as string;
    const fileName = (fileData.fileName as string) || 'download.rbxm';
    const contentType = (fileData.contentType as string) || 'application/octet-stream';

    // Verify the user has purchased this product (or is owner/admin)
    const isOwner = session.user.role === 'owner' || session.user.role === 'admin';

    if (!isOwner) {
      const purchaseSnapshot = await db
        .ref('userProducts')
        .orderByChild('userId')
        .equalTo(session.user.robloxUserId)
        .once('value');

      let hasPurchased = false;

      if (purchaseSnapshot.exists()) {
        const purchases = purchaseSnapshot.val() as Record<string, Record<string, unknown>>;
        for (const [_id, data] of Object.entries(purchases)) {
          if (
            data.productId === productId &&
            (data.revokedAt === null || data.revokedAt === undefined)
          ) {
            hasPurchased = true;
            break;
          }
        }
      }

      if (!hasPurchased) {
        return NextResponse.json(
          { error: 'You have not purchased this product.' },
          { status: 403 }
        );
      }
    }

    // Decode base64 and send as binary
    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[GET /api/download] Error:', error);
    return NextResponse.json(
      { error: 'Failed to download file.' },
      { status: 500 }
    );
  }
}
