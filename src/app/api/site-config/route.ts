import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

// ============================================================
// GET /api/site-config - Get announced product from site config
// ============================================================

export async function GET() {
  try {
    const snapshot = await db
      .ref('siteConfig/announcedProduct')
      .once('value');

    if (!snapshot.exists()) {
      return NextResponse.json({ announcedProduct: null });
    }

    const announcedProduct = snapshot.val();

    return NextResponse.json({
      announcedProduct: {
        id: announcedProduct.id || null,
        name: announcedProduct.name || '',
        description: announcedProduct.description || '',
        price: announcedProduct.price || 0,
        type: announcedProduct.type || 'other',
        maker: announcedProduct.maker || '',
        images: announcedProduct.images || { front: '', back: '' },
        announcedAt: announcedProduct.announcedAt || null,
      },
    });
  } catch (error) {
    console.error('[GET /api/site-config] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site config.' },
      { status: 500 }
    );
  }
}
