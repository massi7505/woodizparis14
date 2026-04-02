import type { Metadata, Viewport } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import { headers } from 'next/headers';
import { unstable_cache } from 'next/cache';
import './globals.css';
import { prisma } from '@/lib/db';
import CookieConsent from '@/components/CookieConsent';

// Cached siteSettings — shared between generateMetadata and getJsonLd (same request)
const getCachedSiteSettings = unstable_cache(
  () => prisma.siteSettings.findFirst(),
  ['root-site-settings'],
  { revalidate: 60, tags: ['site-settings'] },
);

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '700', '900'],
  display: 'swap',
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111827',
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getCachedSiteSettings();
    const baseUrl = settings?.canonicalUrl?.replace(/\/$/, '') || 'https://woodiz.fr';
    const siteName = settings?.siteName || 'Woodiz';
    const title = settings?.metaTitle || `${siteName} — Pizzeria artisanale Paris 15`;
    const description =
      settings?.metaDescription ||
      settings?.siteSlogan ||
      'Pizzeria artisanale au feu de bois à Paris 15. Pâte fraîche maison, ingrédients frais du marché. Livraison et à emporter — Commander en ligne.';
    const keywords =
      settings?.metaKeywords ||
      'pizza, pizzeria, paris 15, artisanale, feu de bois, livraison pizza, pizza paris, pizzeria paris 15, commander pizza paris';
    const image = settings?.metaImageUrl || undefined;
    const ogTitle = settings?.ogTitle || title;
    const ogDescription = settings?.ogDescription || description;

    return {
      metadataBase: new URL(baseUrl),
      title: {
        default: title,
        template: `%s | ${siteName}`,
      },
      description,
      keywords,
      authors: [{ name: siteName }],
      creator: siteName,
      publisher: siteName,
      category: 'restaurant',

      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },

      openGraph: {
        type: 'website',
        locale: 'fr_FR',
        alternateLocale: ['en_US', 'it_IT', 'es_ES'],
        title: ogTitle,
        description: ogDescription,
        siteName,
        ...(image && {
          images: [{ url: image, width: 1200, height: 630, alt: ogTitle }],
        }),
      },

      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description: ogDescription,
        ...(image && { images: [image] }),
      },
    };
  } catch {
    return {
      title: 'Woodiz — Pizzeria artisanale Paris 15',
      description: 'Pizzeria artisanale au feu de bois à Paris 15.',
    };
  }
}

async function getJsonLd() {
  try {
    const settings = await getCachedSiteSettings();
    const baseUrl = settings?.canonicalUrl?.replace(/\/$/, '') || 'https://woodiz.fr';
    const [hours, reviews] = await Promise.all([
      prisma.openingHours.findMany({ orderBy: { dayOfWeek: 'asc' } }),
      prisma.review.findMany({ where: { isVisible: true }, orderBy: { sortOrder: 'asc' }, take: 10 }),
    ]);

    const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const openingHoursSpec = hours
      .filter(h => h.isOpen)
      .flatMap(h => {
        let slots: { open: string; close: string }[] = [];
        try { slots = JSON.parse(h.slots); } catch { slots = []; }
        return slots.map(s => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: `https://schema.org/${DAY_NAMES[h.dayOfWeek]}`,
          opens: s.open,
          closes: s.close,
        }));
      });

    return {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: settings?.siteName || 'Woodiz',
      description: settings?.metaDescription || settings?.siteSlogan || 'Pizzeria artisanale au feu de bois',
      url: `${baseUrl}/linktree`,
      ...(settings?.metaImageUrl && { image: settings.metaImageUrl }),
      ...(settings?.phoneNumber && { telephone: settings.phoneNumber }),
      ...(settings?.address && {
        address: {
          '@type': 'PostalAddress',
          streetAddress: settings.address,
          addressLocality: 'Paris',
          addressCountry: 'FR',
        },
      }),
      ...(settings?.googleMapsUrl && {
        hasMap: settings.googleMapsUrl,
        geo: { '@type': 'GeoCoordinates' },
      }),
      priceRange: '€€',
      servesCuisine: ['Pizza', 'Italian', 'Mediterranean'],
      currenciesAccepted: 'EUR',
      paymentAccepted: 'Cash, Credit Card',
      hasMenu: `${baseUrl}/menu`,
      ...(settings?.googleReviewsUrl && { sameAs: [settings.googleReviewsUrl, settings.instagramUrl].filter(Boolean) }),
      ...(settings?.googleRating && settings?.googleReviewCount && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: settings.googleRating,
          reviewCount: settings.googleReviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
      ...(reviews.length > 0 && {
        review: reviews.map(r => ({
          '@type': 'Review',
          author: { '@type': 'Person', name: r.authorName },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: r.rating,
            bestRating: 5,
            worstRating: 1,
          },
          ...(r.text && { reviewBody: r.text }),
          ...(r.date && { datePublished: r.date.toISOString().split('T')[0] }),
        })),
      }),
      ...(openingHoursSpec.length > 0 && { openingHoursSpecification: openingHoursSpec }),
    };
  } catch {
    return null;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const jsonLd = await getJsonLd();
  const settings = await getCachedSiteSettings();
  const faviconUrl = settings?.faviconUrl || null;

  return (
    <html lang="fr" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://public.blob.vercel-storage.com" crossOrigin="anonymous" />
        {faviconUrl ? (
          <>
            <link rel="icon" href={faviconUrl} />
            <link rel="shortcut icon" href={faviconUrl} />
            <link rel="apple-touch-icon" href={faviconUrl} />
          </>
        ) : (
          <link rel="icon" href="/favicon.ico" />
        )}
        {jsonLd && (
          <script
            type="application/ld+json"
            nonce={nonce}
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
      </head>
      <body className="font-body bg-gray-950 text-white antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[999] focus:px-4 focus:py-2 focus:bg-white focus:text-gray-900 focus:rounded-lg focus:font-semibold focus:text-sm focus:shadow-lg"
        >
          Aller au contenu principal
        </a>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
