import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import { pickBestTranslation } from '@/lib/menu-data';
import { getCachedSeoSettings, buildSeoBase, buildSharedMeta } from '@/lib/seo';

function fetchLinktreeLocaleData(locale: string) {
  return unstable_cache(
    async () => {
      const p = prisma as any;
      const [ltSettings, ltButtons, hours, banners, promos, faqs, siteSettings, footerData] = await Promise.allSettled([
        prisma.linktreeSettings.findFirst(),
        prisma.linktreeButton.findMany({ where: { isVisible: true }, orderBy: { sortOrder: 'asc' } }),
        prisma.openingHours.findMany({ orderBy: { dayOfWeek: 'asc' } }),
        p.notificationBanner?.findMany?.({
          where: { isVisible: true },
          orderBy: [{ priority: 'desc' }, { sortOrder: 'asc' }],
          include: { translations: true },
        }).catch(() => []) ?? [],
        prisma.promotion.findMany({
          where: { isVisible: true, showOnLinktree: true },
          orderBy: { sortOrder: 'asc' },
          include: { translations: { where: { locale: { in: [...new Set([locale, 'fr'])] } } } },
        }),
        prisma.fAQ.findMany({
          where: { isVisible: true, showOnMenu: true },
          orderBy: { sortOrder: 'asc' },
          include: { translations: { where: { locale } } },
        }),
        prisma.siteSettings.findFirst(),
        prisma.footerSettings.findFirst(),
      ]);
      return { ltSettings, ltButtons, hours, banners, promos, faqs, siteSettings, footerData };
    },
    [`linktree-page-${locale}`],
    { revalidate: 30, tags: ['linktree', 'menu'] },
  )();
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  try {
    const { locale } = await params;
    const settings = await getCachedSeoSettings();
    const seo = buildSeoBase(settings);
    const pageUrl = `${seo.baseUrl}/${locale}/linktree`;
    return {
      title: { absolute: seo.title },
      ...buildSharedMeta(seo, pageUrl),
      alternates: {
        canonical: pageUrl,
        languages: {
          fr: `${seo.baseUrl}/linktree`,
          en: `${seo.baseUrl}/en/linktree`,
          it: `${seo.baseUrl}/it/linktree`,
          es: `${seo.baseUrl}/es/linktree`,
          'x-default': `${seo.baseUrl}/linktree`,
        },
      },
    };
  } catch {
    return { title: 'Woodiz — Pizzeria artisanale Paris 15' };
  }
}
import VisitTracker from '@/components/VisitTracker';
import LinktreeCover from '@/components/linktree/LinktreeCover';
import LinktreeProfile from '@/components/linktree/LinktreeProfile';
import LinktreeButtons from '@/components/linktree/LinktreeButtons';
import LinktreeHours from '@/components/linktree/LinktreeHours';
import LinktreePromos from '@/components/linktree/LinktreePromos';
import LinktreeFAQs from '@/components/linktree/LinktreeFAQs';
import LinktreeFooter from '@/components/linktree/LinktreeFooter';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { SmartNotificationBar } from '@/components/linktree/NotificationBar';

export const revalidate = 30;

type Props = { params: Promise<{ locale: string }> };

export default async function LinktreePage({ params }: Props) {
  const { locale } = await params;

  const { ltSettings, ltButtons, hours, banners, promos, faqs, siteSettings, footerData } = await fetchLinktreeLocaleData(locale);

  const settings = ltSettings.status === 'fulfilled' ? ltSettings.value : null;
  const buttons = ltButtons.status === 'fulfilled' ? ltButtons.value : [];
  const openHours = hours.status === 'fulfilled' ? hours.value : [];
  const notifBanners = (banners.status === 'fulfilled' ? banners.value : []) as any[];
  const promotions = (promos.status === 'fulfilled' ? promos.value : []).map((p: any) => ({
    ...p,
    promoPrice: p.promoPrice != null ? p.promoPrice.toString() : null,
    originalPrice: p.originalPrice != null ? p.originalPrice.toString() : null,
    translations: pickBestTranslation(p.translations || [], locale),
  }));
  const faqsList = faqs.status === 'fulfilled' ? faqs.value : [];
  const faqSchemaItems = (faqsList as any[]).filter(f => f.translations?.[0]).map(f => ({
    '@type': 'Question',
    name: f.translations[0].question,
    acceptedAnswer: { '@type': 'Answer', text: f.translations[0].answer },
  }));
  const site = siteSettings.status === 'fulfilled' ? siteSettings.value : null;
  const footer = footerData.status === 'fulfilled' ? footerData.value : null;

  // Redirect to FR if this locale is disabled
  const enabledLocales: string[] = (() => {
    try { return JSON.parse(site?.enabledLocales || '["fr","en","it","es"]'); } catch { return ['fr','en','it','es']; }
  })();
  if (!enabledLocales.includes(locale)) redirect('/linktree');

  const bgStyle = settings?.bgImageUrl
    ? { backgroundImage: `url(${settings.bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: settings?.bgColor || '#111827' };

  const allLocales = [['fr', 'FR'], ['en', 'EN'], ['it', 'IT'], ['es', 'ES']] as const;
  const visibleLocales = allLocales.filter(([code]) => enabledLocales.includes(code));

  return (
    <div className="min-h-screen" style={bgStyle}>
      {settings?.showFaqs && faqSchemaItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqSchemaItems }) }}
        />
      )}
      <VisitTracker page="linktree" />
      {openHours.length > 0 && (
        <SmartNotificationBar banners={notifBanners} openingHours={openHours} locale={locale} />
      )}
      <div className="max-w-md mx-auto pb-12 relative">
        {visibleLocales.length > 1 && (
          <div className="absolute top-3 right-3 z-40">
            <LanguageSwitcher
              locale={locale}
              options={visibleLocales.map(([code]) => ({
                code,
                href: code === 'fr' ? '/linktree' : `/${code}/linktree`,
              }))}
            />
          </div>
        )}
        <LinktreeCover settings={settings} site={site} />
        <LinktreeProfile settings={settings} site={site} hours={openHours} locale={locale} />
        {settings?.showPromos && promotions.length > 0 && <LinktreePromos promos={promotions} locale={locale} />}
        <LinktreeButtons buttons={buttons} locale={locale} />
        {settings?.showHours && openHours.length > 0 && <LinktreeHours hours={openHours} locale={locale} />}
        {settings?.showFaqs && faqsList.length > 0 && <LinktreeFAQs faqs={faqsList} locale={locale} />}
        <LinktreeFooter site={site} footer={footer} />
      </div>
    </div>
  );
}
