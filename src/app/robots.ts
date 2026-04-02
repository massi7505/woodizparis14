import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export const revalidate = 86400; // regenerate daily

export default async function robots(): Promise<MetadataRoute.Robots> {
  let baseUrl = 'https://woodiz.fr';
  try {
    const settings = await prisma.siteSettings.findFirst();
    if (settings?.canonicalUrl) baseUrl = settings.canonicalUrl.replace(/\/$/, '');
  } catch {}

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/admin/*', '/api/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
