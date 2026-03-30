import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { parseProduct } from '@/lib/firebase';
import type { AuditLog, ProductTag, ProductType } from '@/types';

// GET /api/products — List all products with optional filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const showAll = searchParams.get('showAll') === 'true';
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const tagsRaw = searchParams.get('tags') || '';
    const typesRaw = searchParams.get('types') || '';
    const boosterOnly = searchParams.get('boosterOnly') === 'true';
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');

    const filterTags = tagsRaw
      ? (tagsRaw.split(',').map((t) => t.trim().toLowerCase()) as ProductTag[])
      : null;
    const filterTypes = typesRaw
      ? (typesRaw.split(',').map((t) => t.trim().toLowerCase()) as ProductType[])
      : null;
    const minPrice = priceMin ? parseFloat(priceMin) : null;
    const maxPrice = priceMax ? parseFloat(priceMax) : null;

    const snapshot = await db.ref('products').once('value');

    if (!snapshot.exists()) {
      return NextResponse.json([]);
    }

    const raw = snapshot.val() as Record<string, Record<string, unknown>>;
    const products: ReturnType<typeof parseProduct>[] = [];

    for (const [id, data] of Object.entries(raw)) {
      const product = parseProduct(id, data);

      // Filter: only active products unless showAll is true
      if (!showAll && !product.active) continue;

      // Filter: search by name
      if (search && !product.name.toLowerCase().includes(search)) continue;

      // Filter: by tags
      if (filterTags && filterTags.length > 0) {
        const hasTag = product.tags.some((t) =>
          filterTags.includes(t)
        );
        if (!hasTag) continue;
      }

      // Filter: by type
      if (filterTypes && filterTypes.length > 0) {
        if (!filterTypes.includes(product.type)) continue;
      }

      // Filter: booster exclusive
      if (boosterOnly && !product.boosterExclusive) continue;

      // Filter: price range
      if (minPrice !== null && product.price < minPrice) continue;
      if (maxPrice !== null && product.price > maxPrice) continue;

      products.push(product);
    }

    // Sort by createdAt descending (newest first)
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

// POST /api/products — Create a new product (owner only)
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
      type,
      tags,
      images,
      maker,
      boosterExclusive,
      active,
      announce,
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Product name is required.' },
        { status: 400 }
      );
    }

    const productRef = db.ref('products').push();
    const productId = productRef.key!;

    const productData: Record<string, unknown> = {
      name: name.trim(),
      description: description || '',
      price: typeof price === 'number' ? price : 0,
      gamepassId: typeof gamepassId === 'number' ? gamepassId : null,
      type: type || 'other',
      tags: Array.isArray(tags) ? tags : [],
      images: {
        front: images?.front || '',
        back: images?.back || '',
      },
      maker: maker || '',
      boosterExclusive: boosterExclusive === true,
      active: active !== false,
      createdAt: Date.now(),
      createdBy: session.user.discordId,
    };

    await productRef.set(productData);

    // Audit log
    const auditRef = db.ref('auditLogs').push();
    const auditLog: Omit<AuditLog, 'id'> = {
      action: 'create_product',
      performedBy: session.user.discordId,
      performedByRole: session.user.role,
      targetProductId: productId,
      details: `Created product "${name.trim()}" (ID: ${productId})`,
      createdAt: Date.now(),
    };
    await auditRef.set(auditLog);

    // Handle announcement if requested
    if (announce) {
      const announcedProduct = {
        id: productId,
        name: name.trim(),
        description: description || '',
        price: typeof price === 'number' ? price : 0,
        type: type || 'other',
        maker: maker || '',
        images: {
          front: images?.front || '',
          back: images?.back || '',
        },
        announcedAt: Date.now(),
      };

      await db.ref('siteConfig/announcedProduct').set(announcedProduct);

      // Audit log for announcement
      const announceAuditRef = db.ref('auditLogs').push();
      const announceAuditLog: Omit<AuditLog, 'id'> = {
        action: 'announce_product',
        performedBy: session.user.discordId,
        performedByRole: session.user.role,
        targetProductId: productId,
        details: `Announced product "${name.trim()}" (ID: ${productId})`,
        createdAt: Date.now(),
      };
      await announceAuditRef.set(announceAuditLog);
    }

    const createdProduct = parseProduct(productId, productData);

    return NextResponse.json(createdProduct, { status: 201 });
  } catch (error) {
    console.error('[POST /api/products] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
