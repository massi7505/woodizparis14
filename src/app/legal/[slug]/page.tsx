import { prisma } from '@/lib/db';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getCachedSeoSettings, buildSeoBase } from '@/lib/seo';

export const dynamic = 'force-dynamic';

function tJson(json: string | null | undefined, locale = 'fr', fb = ''): string {
  if (!json) return fb;
  try { const o = JSON.parse(json); return o[locale] || o.fr || fb; } catch { return fb; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = prisma as any;
  const [page, settings] = await Promise.all([
    p.legalPage.findUnique({ where: { slug } }).catch(() => null),
    getCachedSeoSettings(),
  ]);
  const { baseUrl } = buildSeoBase(settings);
  const title = tJson(page?.titleJson, 'fr', slug);
  const content = tJson(page?.contentJson, 'fr', '');
  const description = content ? content.slice(0, 155).replace(/\s+/g, ' ').trim() + '…' : undefined;
  return {
    title,
    ...(description && { description }),
    robots: { index: false, follow: false },
    alternates: { canonical: `${baseUrl}/legal/${slug}` },
  };
}

export default async function LegalPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = prisma as any;
  const [page, site] = await Promise.all([
    p.legalPage.findUnique({ where: { slug } }).catch(() => null),
    p.siteSettings.findFirst().catch(() => null),
  ]);
  const primaryColor = site?.primaryColor || '#F59E0B';
  const title = tJson(page?.titleJson, 'fr', slug);
  const content = tJson(page?.contentJson, 'fr', '');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-4 sticky top-0 bg-white z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/menu" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Menu</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-900">{title}</span>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-gray-900 mb-8" style={{ borderBottom: `3px solid ${primaryColor}`, paddingBottom: '1rem' }}>
          {title}
        </h1>
        {content ? (
          <div
            className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {content}
          </div>
        ) : (
          <p className="text-gray-400 italic">Contenu à renseigner dans l&apos;administration.</p>
        )}
      </div>
      {/* Footer */}
      <div className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        <Link href="/menu" className="hover:text-gray-600 transition-colors">← Retour au menu</Link>
      </div>
    </div>
  );
}
