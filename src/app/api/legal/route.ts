import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

const DEFAULT_LEGAL = [
  { slug: 'mentions-legales', titleJson: '{"fr":"Mentions légales","en":"Legal Notice","it":"Note legali","es":"Aviso legal"}' },
  { slug: 'politique-confidentialite', titleJson: '{"fr":"Politique de confidentialité","en":"Privacy Policy","it":"Privacy","es":"Privacidad"}' },
  { slug: 'politique-cookies', titleJson: '{"fr":"Politique de cookies","en":"Cookie Policy","it":"Cookie","es":"Cookies"}' },
  { slug: 'allergenes', titleJson: '{"fr":"Tableau des allergènes","en":"Allergen Table","it":"Tabella allergeni","es":"Tabla de alérgenos"}' },
];

export async function GET() {
  const p = prisma as any;
  // Ensure defaults exist
  for (const d of DEFAULT_LEGAL) {
    await p.legalPage.upsert({ where: { slug: d.slug }, update: {}, create: d });
  }
  const pages = await p.legalPage.findMany({ orderBy: { id: 'asc' } });
  return NextResponse.json(pages);
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { id: _id, createdAt: _ca, updatedAt: _ua, ...data } = body;
  const p = prisma as any;
  const page = await p.legalPage.update({
    where: { slug: data.slug },
    data: { ...data, updatedAt: new Date() },
  });
  return NextResponse.json(page);
}
