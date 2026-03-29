import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { parseProduct } from '@/lib/firebase';
import type { Product, ProductTag, ProductType, AuditLog } from '@/types';

// ============================================================
// GET /api/products - List all products with filtering
// ============================================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) as ProductTag[] | undefined;
    const types = searchParams.get('types')?.split(',').filter(Boolean) as ProductType[] | undefined;
    const priceMin = searchParams.get('priceMin')
      ? parseFloat(searchParams.get('priceMin')!)
      : undefined;
    const priceMax = searchParams.get('priceMax')
      ? parseFloat(searchParams.get('priceMax')!)
      : undefined;
    const boosterOnly = searchParams.get('boosterOnly') === 'true';
    const showAll = searchParams.get('showAll') === 'true';

    // Check if the user is an owner (for showAll)
    const session = await getServerSession(authOptions);
    const isOwner = session?.user?.role === 'owner';

    const snapshot = await db.ref('products').once('value');
    const raw = snapshot.val() || {};

    let products: Product[] = [];

    for (const [id, data] of Object.entries(raw)) {
      const product = parseProduct(id, data as Record<string, unknown>);

      // Skip inactive products unless owner requests all
      if (!product.active && !isOwner && !showAll) continue;

      products.push(product);
    }

    // Apply filters
    if (search) {
      const lowerSearch = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerSearch) ||
          p.description.toLowerCase().includes(lowerSearch) ||
          p.maker.toLowerCase().includes(lowerSearch)
      );
    }

    if (tags && tags.length > 0) {
      products = products.filter((p) =>
        tags.some((tag) => p.tags.includes(tag))
      );
    }

    if (types && types.length > 0) {
      products = products.filter((p) => types.includes(p.type));
    }

    if (priceMin !== undefined) {
      products = products.filter((p) => p.price >= priceMin!);
    }

    if (priceMax !== undefined) {
      products = products.filter((p) => p.price <= priceMax!);
    }

    if (boosterOnly) {
      products = products.filter((p) => p.boosterExclusive);
    }

    // Sort by newest first
    products.sort((a, b) => {
      const aTime = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
      const bTime = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
      return bTime - aTime;
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('[GET /api/products] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/products - Create a new product (owner only)
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Unauthorized. Owner access required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      description,
      price,
      gamepassId,
      tags = [],
      type = 'other',
      images = { front: '', back: '' },
      maker = '',
      boosterExclusive = false,
      announce = false,
    } = body;

    if (!name || typeof price !== 'number') {
      return NextResponse.json(
        { error: 'Name and price are required.' },
        { status: 400 }
      );
    }

    const productRef = db.ref('products').push();
    const productId = productRef.key!;

    // Handle announce: add "new" tag
    const finalTags: ProductTag[] = announce
      ? [...new Set([...tags, 'new'] as ProductTag[])]
      : tags;

    const productData: Omit<Product, 'id'> = {
      name,
      description: description || '',
      price,
      gamepassId: gamepassId || null,
      active: true,
      createdAt: Date.now(),
      createdBy: session.user.discordId,
      tags: finalTags,
      type,
      images: {
        front: images.front || '',
        back: images.back || '',
      },
      maker,
      boosterExclusive,
    };

    await productRef.set(productData);

    // Handle announcement
    if (announce) {
      // Write to siteConfig/announcedProduct
      await db.ref('siteConfig/announcedProduct').set({
        id: productId,
        name,
        description: description || '',
        price,
        type,
        maker,
        images,
        announcedAt: Date.now(),
      });

      // Send Discord webhook
      try {
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (webhookUrl) {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              embeds: [
                {
                  title: `🆕 New Product: ${name}`,
                  description: description || 'No description provided.',
                  color: 0x5865f2,
                  fields: [
                    { name: 'Price', value: `R$${price}`, inline: true },
                    { name: 'Type', value: type, inline: true },
                    { name: 'Maker', value: maker || 'Unknown', inline: true },
                  ],
                  image: images.front
                    ? { url: images.front }
                    : undefined,
                  timestamp: new Date().toISOString(),
                },
              ],
            }),
          });
        }
      } catch (webhookError) {
        console.error('[POST /api/products] Webhook error:', webhookError);
        // Non-blocking: don't fail the product creation
      }
    }

    // Create audit log
    const auditRef = db.ref('auditLogs').push();
    const auditLog: Omit<AuditLog, 'id'> = {
      action: 'create_product',
      performedBy: session.user.discordId,
      performedByRole: session.user.role,
      targetProductId: productId,
      details: `Created product "${name}" (ID: ${productId})${announce ? ' with announcement' : ''}`,
      createdAt: Date.now(),
    };
    await auditRef.set(auditLog);

    return NextResponse.json(
      { id: productId, ...productData },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/products] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
