import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

const DEFAULT_COL1 = JSON.stringify({
  title: 'Notre Carte',
  items: [
    { label: 'Base Tomate', url: '/menu' },
    { label: 'Base Crème', url: '/menu' },
    { label: 'Boissons', url: '/menu' },
    { label: 'Notre Histoire', url: '/notre-histoire' },
  ],
});
const DEFAULT_COL2 = JSON.stringify({
  title: 'Commander',
  items: [],
});
const DEFAULT_COL3 = JSON.stringify({ title: '', items: [] });
const DEFAULT_COL4 = JSON.stringify({ title: 'Newsletter', items: [] });

export async function GET() {
  try {
    let settings = await (prisma as any).footerSettings.findFirst();
    if (!settings) {
      settings = await (prisma as any).footerSettings.create({
        data: {
          id: 1,
          bgColor: '#0f172a',
          textColor: '#9CA3AF',
          accentColor: '#F59E0B',
          col1Json: DEFAULT_COL1,
          col2Json: DEFAULT_COL2,
          col3Json: DEFAULT_COL3,
          col4Json: DEFAULT_COL4,
          copyright: '© {year} Woodiz. Tous droits réservés.',
        },
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch footer settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, ...data } = body;

    const settings = await (prisma as any).footerSettings.upsert({
      where: { id: 1 },
      update: { ...data, updatedAt: new Date() },
      create: {
        id: 1,
        col1Json: DEFAULT_COL1,
        col2Json: DEFAULT_COL2,
        col3Json: DEFAULT_COL3,
        col4Json: DEFAULT_COL4,
        copyright: '© {year} Woodiz. Tous droits réservés.',
        ...data,
      },
    });
    revalidatePath('/', 'layout');
    revalidateTag('menu');
    return NextResponse.json(settings);
  } catch (error) {
    console.error('[PATCH /api/footer-settings]', error);
    return NextResponse.json({ error: 'Failed to update footer settings' }, { status: 500 });
  }
}
