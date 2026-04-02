import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export const revalidate = 60;

type Props = { params: Promise<{ locale: string }> };

export default async function LocaleRootPage({ params }: Props) {
  const { locale } = await params;
  try {
    const settings = await prisma.siteSettings.findFirst();
    const target = settings?.homePage === 'menu' ? 'menu' : 'linktree';
    redirect(`/${locale}/${target}`);
  } catch {
    redirect(`/${locale}/linktree`);
  }
}
