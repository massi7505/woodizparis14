import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getSessionFromReq } from '@/lib/auth';

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'image/x-icon', 'image/vnd.microsoft.icon',
  'video/mp4', 'video/webm',
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Auth check: only for token generation requests (upload-completed comes from Vercel servers)
  if (body.type === 'blob.generate-client-token') {
    const session = await getSessionFromReq(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_TYPES,
        maximumSizeInBytes: 100 * 1024 * 1024, // 100 MB
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log('[blob upload completed]', blob.url);
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (e: any) {
    console.error('[upload error]', e);
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 400 });
  }
}
