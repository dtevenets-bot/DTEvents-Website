import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'

// GET /api/site-config - Fetch site configuration (public)
// Returns the announced product for the hero slider
export async function GET() {
  try {
    const snapshot = await db.ref('siteConfig/announcedProduct').once('value')
    const data = snapshot.val()

    if (!data) {
      return NextResponse.json({ announcedProduct: null })
    }

    return NextResponse.json({ announcedProduct: data })
  } catch (error) {
    console.error('Error fetching site config:', error)
    return NextResponse.json({ announcedProduct: null })
  }
}
