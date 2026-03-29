import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import type { AuditLog, UserRole } from '@/types';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 4,
  admin: 3,
  booster: 2,
  user: 1,
};

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      !ROLE_HIERARCHY[session.user.role] ||
      ROLE_HIERARCHY[session.user.role] < ROLE_HIERARCHY['admin']
    ) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin or higher access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const action = searchParams.get('action') || undefined;
    const targetUserId = searchParams.get('targetUserId') || undefined;

    const snapshot = await db.ref('auditLogs').once('value');

    if (!snapshot.exists()) {
      return NextResponse.json([]);
    }

    const raw = snapshot.val() as Record<string, Record<string, unknown>>;

    let logs: AuditLog[] = Object.entries(raw).map(([id, data]) => ({
      id,
      action: (data.action as AuditLog['action']) || 'unknown',
      performedBy: (data.performedBy as string) || '',
      performedByRole: (data.performedByRole as UserRole) || 'user',
      targetUserId: (data.targetUserId as string) || undefined,
      targetProductId: (data.targetProductId as string) || undefined,
      details: (data.details as string) || '',
      createdAt: data.createdAt ?? Date.now(),
    }));

    if (action) {
      logs = logs.filter((log) => log.action === action);
    }

    if (targetUserId) {
      logs = logs.filter((log) => log.targetUserId === targetUserId);
    }

    logs.sort((a, b) => {
      const aTime = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt as string).getTime();
      const bTime = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt as string).getTime();
      return bTime - aTime;
    });

    if (limit > 0) {
      logs = logs.slice(0, limit);
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error('[GET /api/admin/audit] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs.' },
      { status: 500 }
    );
  }
}
