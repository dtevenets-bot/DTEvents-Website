import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import type { AuditLog } from '@/types';

// 3MB max file size (base64 encoded would be ~4MB, within Vercel's 4.5MB body limit)
const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.rbxm', '.rbxmx', '.rbxl', '.rbxlx'];

// GET: Return file records for all products (owner only, used to show file status in table)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Unauthorized. Owner access required.' },
        { status: 403 }
      );
    }

    const snapshot = await db.ref('rbxmFiles').once('value');
    if (!snapshot.exists()) {
      return NextResponse.json({});
    }

    const raw = snapshot.val() as Record<string, Record<string, unknown>>;
    const records: Record<string, { fileName: string; fileSize: number; uploadedAt: number }> = {};

    for (const [productId, data] of Object.entries(raw)) {
      records[productId] = {
        fileName: (data.fileName as string) || 'unknown',
        fileSize: typeof data.fileSize === 'number' ? data.fileSize : 0,
        uploadedAt: typeof data.uploadedAt === 'number' ? data.uploadedAt : 0,
      };
    }

    return NextResponse.json(records);
  } catch (error) {
    console.error('[GET /api/upload] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file records.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Unauthorized. Owner access required.' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const productId = formData.get('productId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided.' },
        { status: 400 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'No product ID provided.' },
        { status: 400 }
      );
    }

    // Validate file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!hasValidExtension) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB.` },
        { status: 400 }
      );
    }

    // Validate product exists
    const productSnapshot = await db.ref(`products/${productId}`).once('value');
    if (!productSnapshot.exists()) {
      return NextResponse.json(
        { error: 'Product not found.' },
        { status: 404 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    // Store in Firebase RTDB
    const fileRecord = {
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type || 'application/octet-stream',
      uploadedAt: Date.now(),
      uploadedBy: session.user.discordId,
      base64Data,
    };

    await db.ref(`rbxmFiles/${productId}`).set(fileRecord);

    // Audit log
    const auditRef = db.ref('auditLogs').push();
    const auditLog: Omit<AuditLog, 'id'> = {
      action: 'upload_file',
      performedBy: session.user.discordId,
      performedByRole: session.user.role,
      targetProductId: productId,
      details: `Uploaded file "${file.name}" (${(file.size / 1024).toFixed(1)}KB) for product ${productId}`,
      createdAt: Date.now(),
    };
    await auditRef.set(auditLog);

    return NextResponse.json({
      message: 'File uploaded successfully.',
      fileName: file.name,
      fileSize: file.size,
      productId,
    });
  } catch (error) {
    console.error('[POST /api/upload] Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Unauthorized. Owner access required.' },
        { status: 403 }
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
        { error: 'No file found for this product.' },
        { status: 404 }
      );
    }

    const fileData = fileSnapshot.val() as Record<string, unknown>;
    const fileName = (fileData.fileName as string) || 'unknown';

    // Delete from Firebase
    await db.ref(`rbxmFiles/${productId}`).remove();

    // Audit log
    const auditRef = db.ref('auditLogs').push();
    const auditLog: Omit<AuditLog, 'id'> = {
      action: 'delete_file',
      performedBy: session.user.discordId,
      performedByRole: session.user.role,
      targetProductId: productId,
      details: `Deleted file "${fileName}" from product ${productId}`,
      createdAt: Date.now(),
    };
    await auditRef.set(auditLog);

    return NextResponse.json({
      message: 'File deleted successfully.',
      productId,
    });
  } catch (error) {
    console.error('[DELETE /api/upload] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file.' },
      { status: 500 }
    );
  }
}
