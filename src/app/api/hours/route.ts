import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function GET() {
  try {
    const hours = await prisma.openingHours.findMany({ orderBy: { dayOfWeek: 'asc' } });
    return NextResponse.json(hours);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch hours' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    // body is an array of all days to upsert
    if (Array.isArray(body)) {
      await prisma.openingHours.deleteMany();
      const rows = await prisma.openingHours.createMany({ data: body });
      revalidatePath('/', 'layout');
      revalidateTag('menu');
      return NextResponse.json(rows);
    }
    const row = await prisma.openingHours.create({ data: body });
    revalidatePath('/', 'layout');
    revalidateTag('menu');
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to save hours' }, { status: 500 });
  }
}
