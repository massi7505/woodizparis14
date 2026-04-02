import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(leads);
  } catch (e) {
    console.error('[leads GET]', e);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstname, phone, email, source } = body;

    if (!firstname && !phone && !email) {
      return NextResponse.json({ error: 'Au moins un champ requis' }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        firstname: firstname || null,
        phone: phone || null,
        email: email || null,
        source: source || 'popup',
      },
    });
    revalidatePath('/admin/leads');
    return NextResponse.json(lead, { status: 201 });
  } catch (e) {
    console.error('[leads POST]', e);
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id) {
      const numId = parseInt(id, 10);
      if (isNaN(numId) || numId <= 0) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
      }
      await prisma.lead.delete({ where: { id: numId } });
    } else {
      await prisma.lead.deleteMany();
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[leads DELETE]', e);
    return NextResponse.json({ error: 'Failed to delete lead(s)' }, { status: 500 });
  }
}
