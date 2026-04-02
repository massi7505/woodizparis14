/**
 * fix-notifications.ts
 * - Désactive l'ancienne NotificationBar (Deliveroo/Amazon)
 * - Crée un banner "Restaurant fermé" dans le nouveau système
 * Usage : npx tsx prisma/fix-notifications.ts
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Désactiver l'ancienne notification bar Deliveroo/Amazon
  await prisma.notificationBar.updateMany({ data: { isVisible: false } });
  console.log('✅ Ancienne notification bar désactivée');

  // 2. Créer le banner "Restaurant fermé" dans le nouveau système (s'il n'existe pas déjà)
  const existing = await (prisma as any).notificationBanner.findFirst({
    where: { type: 'closed' },
  });

  if (!existing) {
    await (prisma as any).notificationBanner.create({
      data: {
        isVisible: false, // désactivé par défaut, à activer depuis l'admin
        bgColor: '#1F2937',
        textColor: '#f87171',
        icon: '🔒',
        type: 'closed',
        priority: 10,
        displayDuration: 10000,
        animType: 'slide',
        scheduleEnabled: false,
        scheduleStart: null,
        scheduleEnd: null,
        scheduleDays: '[0,1,2,3,4,5,6]',
        sortOrder: 0,
        translations: {
          create: [
            { locale: 'fr', text: '' }, // vide = texte auto "Restaurant fermé · Réouverture dans X"
            { locale: 'en', text: '' },
            { locale: 'it', text: '' },
            { locale: 'es', text: '' },
          ],
        },
      },
    });
    console.log('✅ Banner "Restaurant fermé" créé (désactivé par défaut)');
  } else {
    console.log('ℹ️  Banner "Restaurant fermé" existe déjà');
  }

  console.log('\n🎉 Terminé !');
  console.log('👉 Allez sur /admin/notification pour activer/désactiver "Restaurant fermé"');
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
