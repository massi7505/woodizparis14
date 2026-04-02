import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    // Sanitize slug: only allow safe characters (Prisma uses parameterized queries but defense-in-depth)
    const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!safeSlug) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });

    const p = prisma as any;
    const page = await p.legalPage.findUnique({ where: { slug: safeSlug } });
    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(page);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch legal page' }, { status: 500 });
  }
}
