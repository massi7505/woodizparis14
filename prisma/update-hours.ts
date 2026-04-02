import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🕐 Mise à jour des horaires d\'ouverture...');

  await prisma.openingHours.deleteMany();

  await prisma.openingHours.createMany({
    data: [
      // dayOfWeek : 0=Lundi, 1=Mardi, 2=Mercredi, 3=Jeudi, 4=Vendredi, 5=Samedi, 6=Dimanche
      {
        dayOfWeek: 0, dayName: 'Lundi', isOpen: true, sortOrder: 0,
        slots: JSON.stringify([
          { open: '18:00', close: '00:00' },
          { open: '00:00', close: '02:00' },
        ]),
      },
      {
        dayOfWeek: 1, dayName: 'Mardi', isOpen: true, sortOrder: 1,
        slots: JSON.stringify([
          { open: '11:30', close: '14:30' },
          { open: '18:00', close: '23:00' },
        ]),
      },
      {
        dayOfWeek: 2, dayName: 'Mercredi', isOpen: true, sortOrder: 2,
        slots: JSON.stringify([
          { open: '11:30', close: '14:30' },
          { open: '18:00', close: '00:00' },
          { open: '00:00', close: '02:00' },
        ]),
      },
      {
        dayOfWeek: 3, dayName: 'Jeudi', isOpen: true, sortOrder: 3,
        slots: JSON.stringify([
          { open: '11:30', close: '14:30' },
          { open: '18:00', close: '00:00' },
          { open: '00:00', close: '02:00' },
        ]),
      },
      {
        dayOfWeek: 4, dayName: 'Vendredi', isOpen: true, sortOrder: 4,
        slots: JSON.stringify([
          { open: '11:30', close: '14:30' },
          { open: '18:00', close: '00:00' },
          { open: '00:00', close: '02:00' },
        ]),
      },
      {
        dayOfWeek: 5, dayName: 'Samedi', isOpen: true, sortOrder: 5,
        slots: JSON.stringify([
          { open: '11:30', close: '14:30' },
          { open: '18:00', close: '00:00' },
          { open: '00:00', close: '02:00' },
        ]),
      },
      {
        dayOfWeek: 6, dayName: 'Dimanche', isOpen: true, sortOrder: 6,
        slots: JSON.stringify([
          { open: '11:30', close: '14:30' },
          { open: '18:00', close: '00:00' },
          { open: '00:00', close: '02:00' },
        ]),
      },
    ],
  });

  console.log('✅ Horaires mis à jour avec succès !');
  console.log('');
  console.log('  Lundi      : 18:00 → 00:00 | 00:00 → 02:00');
  console.log('  Mardi      : 11:30 → 14:30 | 18:00 → 23:00');
  console.log('  Mercredi   : 11:30 → 14:30 | 18:00 → 00:00 | 00:00 → 02:00');
  console.log('  Jeudi      : 11:30 → 14:30 | 18:00 → 00:00 | 00:00 → 02:00');
  console.log('  Vendredi   : 11:30 → 14:30 | 18:00 → 00:00 | 00:00 → 02:00');
  console.log('  Samedi     : 11:30 → 14:30 | 18:00 → 00:00 | 00:00 → 02:00');
  console.log('  Dimanche   : 11:30 → 14:30 | 18:00 → 00:00 | 00:00 → 02:00');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
