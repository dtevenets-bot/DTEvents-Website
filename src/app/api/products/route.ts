import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db, parseProduct } from '@/lib/firebase'
import type { Product, AuditLog } from '@/types'

// GET /api/products - Fetch all active products (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const tagsParam = searchParams.get('tags') || ''
    const typesParam = searchParams.get('types') || ''
    const minPrice = searchParams.get('priceMin') || searchParams.get('minPrice')
    const maxPrice = searchParams.get('priceMax') || searchParams.get('maxPrice')
    const boosterOnly = searchParams.get('boosterOnly') === 'true'
    const showAll = searchParams.get('all') === 'true'
    const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : []
    const types = typesParam ? typesParam.split(',').filter(Boolean) : []

    // Check if user is a booster for boosterOnly filtering
    const session = await getServerSession(authOptions)
    const userRole = session?.user?.role as string | undefined
    const isBooster = userRole === 'booster' || userRole === 'admin' || userRole === 'owner'
    const isOwner = userRole === 'owner'

    const snapshot = await db.ref('products').once('value')
    const data = snapshot.val()

    if (!data) {
      return NextResponse.json([])
    }

    // showAll requires owner role
    if (showAll && !isOwner) {
      return NextResponse.json({ error: 'Forbidden: Owner access required' }, { status: 403 })
    }

    let products: Product[] = Object.values(data)
      .map((p) => parseProduct(p as Record<string, unknown>))
      .filter((p) => showAll ? true : p.active)

    // Filter: search
    if (search) {
      const searchLower = search.toLowerCase()
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.maker.toLowerCase().includes(searchLower)
      )
    }

    // Filter: tags (match all)
    if (tags.length > 0) {
      products = products.filter((p) => tags.every((t) => p.tags.includes(t)))
    }

    // Filter: types (match any)
    if (types.length > 0) {
      products = products.filter((p) => types.includes(p.type))
    }

    // Filter: minPrice
    if (minPrice) {
      products = products.filter((p) => p.price >= Number(minPrice))
    }

    // Filter: maxPrice
    if (maxPrice) {
      products = products.filter((p) => p.price <= Number(maxPrice))
    }

    // Filter: boosterOnly - hide booster exclusive products from non-boosters
    // If boosterOnly=true, show ONLY booster exclusive products (user must be booster)
    if (boosterOnly) {
      if (!isBooster) {
        return NextResponse.json({ error: 'Forbidden: Booster access required' }, { status: 403 })
      }
      products = products.filter((p) => p.boosterExclusive)
    } else {
      // Regular browsing: hide booster exclusive from non-boosters
      if (!isBooster) {
        products = products.filter((p) => !p.boosterExclusive)
      }
    }

    // Sort by newest first
    products.sort((a, b) => b.createdAt - a.createdAt)

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST /api/products - Create a new product (owner only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = session.user.role as string
    if (role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden: Owner access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, price, gamepassId, tags, type, images, maker, boosterExclusive, announce } = body

    if (!name || price === undefined || !gamepassId) {
      return NextResponse.json({ error: 'Missing required fields: name, price, gamepassId' }, { status: 400 })
    }

    if (price < 0) {
      return NextResponse.json({ error: 'Price cannot be negative' }, { status: 400 })
    }

    // If announce is true, add "new" tag automatically
    const finalTags = [...(tags || [])]
    if (announce && !finalTags.includes('new')) {
      finalTags.push('new')
    }

    const ref = db.ref('products').push()
    const id = ref.key!

    const productData = {
      id,
      name,
      description: description || '',
      price: Number(price),
      gamepassId: String(gamepassId),
      active: true,
      createdAt: Date.now(),
      createdBy: session.user.discordId,
      tags: finalTags,
      type: type || 'other',
      images: {
        front: images?.front || '',
        back: images?.back || '',
      },
      maker: maker || '',
      boosterExclusive: Boolean(boosterExclusive),
    }

    await ref.set(productData)

    // If announce, write to siteConfig for hero slider
    if (announce) {
      await db.ref('siteConfig/announcedProduct').set({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        images: productData.images,
        announcedAt: Date.now(),
        productId: id,
      })

      // Send Discord webhook announcement
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL
      if (webhookUrl) {
        try {
          const priceStr = productData.price === 0 ? 'Free' : `${productData.price}R$`
          const fluxKit = finalTags.includes('flux_kit_ready') ? '\n🔧 **Flux Kit Ready**' : ''
          const boosterOnly = productData.boosterExclusive ? '\n👑 **Booster Exclusive**' : ''

          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              embeds: [{
                title: `🎉 NEW PRODUCT: ${productData.name}`,
                description: `${productData.description}\n\n💰 **Price:** ${priceStr}${fluxKit}${boosterOnly}`,
                color: 0x57F287,
                image: productData.images.front ? { url: productData.images.front } : undefined,
                footer: { text: `Product ID: ${id}` },
                timestamp: new Date().toISOString(),
              }],
              content: '@everyone A new product has been released! Check it out on the website.',
            }),
          })
        } catch (webhookError) {
          console.error('Failed to send Discord webhook:', webhookError)
        }
      }
    }

    // Add audit log
    const auditRef = db.ref('auditLogs').push()
    const auditLog: Omit<AuditLog, 'id'> = {
      action: 'product_create',
      actor: {
        discordId: session.user.discordId,
        username: session.user.name || 'Unknown',
      },
      target: {
        productId: id,
      },
      details: {
        productName: name,
        price: Number(price),
        gamepassId: String(gamepassId),
        announced: Boolean(announce),
      },
      timestamp: Date.now(),
    }
    await auditRef.set({ ...auditLog, id: auditRef.key! })

    return NextResponse.json(parseProduct(productData), { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
