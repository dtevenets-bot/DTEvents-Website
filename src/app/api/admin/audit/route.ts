import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/firebase'
import type { AuditLog } from '@/types'

// GET /api/admin/audit - Get audit logs (admin+ required)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = session.user.role as string
    if (role !== 'admin' && role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit')) || 50
    const filter = searchParams.get('filter') || ''

    const snapshot = await db.ref('auditLogs').once('value')
    const data = snapshot.val()

    if (!data) {
      return NextResponse.json([])
    }

    let logs: AuditLog[] = Object.values(data).map(
      (log) => log as AuditLog
    )

    // Filter by action type if specified
    if (filter) {
      logs = logs.filter((log) => log.action === filter)
    }

    // Sort by most recent first
    logs.sort((a, b) => b.timestamp - a.timestamp)

    // Apply limit
    logs = logs.slice(0, limit)

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
