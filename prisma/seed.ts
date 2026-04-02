import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Woodiz database...');

  // ===== ADMIN USER =====
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'ChangeMe123!', 12);
  await prisma.adminUser.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@woodiz.fr' },
    update: {},
    create: { email: process.env.ADMIN_EMAIL || 'admin@woodiz.fr', password: hashedPassword, name: 'Admin Woodiz' },
  });
  console.log('✅ Admin user created');

  // ===== SITE SETTINGS =====
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1, siteName: 'Woodiz Paris 15', siteSlogan: 'Pizza artisanale au feu de bois',
      defaultLanguage: 'fr', homePage: 'linktree',
      primaryColor: '#F59E0B', secondaryColor: '#1F2937', accentColor: '#EF4444',
      backgroundColor: '#111827', textColor: '#FFFFFF',
      phoneNumber: '+33 1 00 00 00 00', address: '93 Rue Lecourbe, 75015 Paris',
      metaTitle: 'Woodiz Paris 15 — Pizza artisanale au feu de bois',
      metaDescription: 'Pizzeria artisanale au feu de bois à Paris 15. Pâte maison, ingrédients frais. Livraison via Uber Eats, Deliveroo.',
    },
  });
  console.log('✅ Site settings created');

  // ===== OPENING HOURS =====
  await prisma.openingHours.deleteMany();
  const hoursData = [
    { dayOfWeek: 0, dayName: 'Lundi',    isOpen: true, sortOrder: 0, slots: JSON.stringify([{ open: '18:00', close: '00:00' }, { open: '00:00', close: '02:00' }]) },
    { dayOfWeek: 1, dayName: 'Mardi',    isOpen: true, sortOrder: 1, slots: JSON.stringify([{ open: '11:30', close: '14:30' }, { open: '18:00', close: '23:00' }]) },
    { dayOfWeek: 2, dayName: 'Mercredi', isOpen: true, sortOrder: 2, slots: JSON.stringify([{ open: '11:30', close: '14:30' }, { open: '18:00', close: '00:00' }, { open: '00:00', close: '02:00' }]) },
    { dayOfWeek: 3, dayName: 'Jeudi',    isOpen: true, sortOrder: 3, slots: JSON.stringify([{ open: '11:30', close: '14:30' }, { open: '18:00', close: '00:00' }, { open: '00:00', close: '02:00' }]) },
    { dayOfWeek: 4, dayName: 'Vendredi', isOpen: true, sortOrder: 4, slots: JSON.stringify([{ open: '11:30', close: '14:30' }, { open: '18:00', close: '00:00' }, { open: '00:00', close: '02:00' }]) },
    { dayOfWeek: 5, dayName: 'Samedi',   isOpen: true, sortOrder: 5, slots: JSON.stringify([{ open: '11:30', close: '14:30' }, { open: '18:00', close: '00:00' }, { open: '00:00', close: '02:00' }]) },
    { dayOfWeek: 6, dayName: 'Dimanche', isOpen: true, sortOrder: 6, slots: JSON.stringify([{ open: '11:30', close: '14:30' }, { open: '18:00', close: '00:00' }, { open: '00:00', close: '02:00' }]) },
  ];
  await prisma.openingHours.createMany({ data: hoursData });
  console.log('✅ Opening hours created');

  // ===== LINKTREE SETTINGS =====
  await prisma.linktreeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1, coverType: 'color', coverColor: '#1a0a00',
      bgColor: '#111111', profileName: 'Woodiz Paris 15',
      profileSubtitle: 'Pizza artisanale au feu de bois 🔥',
      noticeIcon: '📦', noticeText: 'Woodiz – Commande à emporter Pour toute commande, contactez-nous par téléphone ou passez par nos plateformes de commande partenaires',
      showHours: true, showFaqs: true, showPromos: true,
    },
  });

  // ===== LINKTREE BUTTONS =====
  await prisma.linktreeButton.deleteMany();
  const buttonsData = [
    { label: 'Commandez via Uber Eats.', url: 'https://www.ubereats.com', icon: '🛵', bgColor: '#16A34A', textColor: '#FFFFFF', style: 'filled', section: 'commander', sortOrder: 0, isVisible: true },
    { label: 'Commandez via Deliveroo.', url: 'https://www.deliveroo.fr', icon: '🔵', bgColor: '#00CCBC', textColor: '#FFFFFF', style: 'filled', section: 'commander', sortOrder: 1, isVisible: true },
    { label: 'Commandez via Delicity.', url: 'https://www.delicity.com', icon: '🟣', bgColor: '#7C3AED', textColor: '#FFFFFF', style: 'filled', section: 'commander', sortOrder: 2, isVisible: true },
    { label: 'Menu', url: '/menu', icon: '🍕', bgColor: '#F59E0B', textColor: '#111111', style: 'filled', section: 'commander', sortOrder: 3, isVisible: true },
    { label: 'Téléphone', url: 'tel:+33100000000', icon: '📞', bgColor: '#F97316', textColor: '#FFFFFF', style: 'filled', section: 'contact', sortOrder: 4, isVisible: true },
    { label: 'Itinéraire', url: 'https://maps.google.com', icon: '📍', bgColor: '#F97316', textColor: '#FFFFFF', style: 'filled', section: 'contact', sortOrder: 5, isVisible: true },
    { label: 'Commandez sur notre plateforme : c\'est moins cher', url: '/menu', icon: '🌐', bgColor: '#EF4444', textColor: '#FFFFFF', style: 'filled', section: 'discover', sortOrder: 6, isVisible: true },
  ];
  await prisma.linktreeButton.createMany({ data: buttonsData });
  console.log('✅ Linktree buttons created');

  // ===== MENU CATEGORIES =====
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  const categories = [
    { slug: 'base-tomate', iconEmoji: '🍅', sortOrder: 0, names: { fr: 'Base Tomate', en: 'Tomato Base', it: 'Base Pomodoro', es: 'Base Tomate' } },
    { slug: 'base-creme', iconEmoji: '🥛', sortOrder: 1, names: { fr: 'Base Crème', en: 'Cream Base', it: 'Base Crema', es: 'Base Crema' } },
    { slug: 'signatures', iconEmoji: '⭐', sortOrder: 2, names: { fr: 'Signatures', en: 'Signature', it: 'Speciali', es: 'Especiales' } },
    { slug: 'desserts', iconEmoji: '🍰', sortOrder: 3, names: { fr: 'Desserts', en: 'Desserts', it: 'Dolci', es: 'Postres' } },
    { slug: 'boissons', iconEmoji: '🥤', sortOrder: 4, names: { fr: 'Boissons', en: 'Drinks', it: 'Bevande', es: 'Bebidas' } },
  ];

  for (const cat of categories) {
    const created = await prisma.menuCategory.create({
      data: {
        slug: cat.slug, iconEmoji: cat.iconEmoji, isVisible: true, sortOrder: cat.sortOrder,
        translations: {
          create: Object.entries(cat.names).map(([locale, name]) => ({ locale, name })),
        },
      },
    });

    // Add products to base-tomate
    if (cat.slug === 'base-tomate') {
      const products = [
        { slug: 'margherita', price: 10.90, allergens: ['gluten', 'lactose'], badges: ['bestseller'], isFeatured: true, sortOrder: 0,
          names: { fr: 'Margherita', en: 'Margherita', it: 'Margherita', es: 'Margherita' },
          descs: { fr: 'Sauce tomate, mozza, olives noires', en: 'Tomato sauce, mozzarella, black olives', it: 'Salsa pomodoro, mozzarella, olive nere', es: 'Salsa tomate, mozzarella, aceitunas negras' } },
        { slug: 'regina', price: 11.90, allergens: ['gluten', 'lactose'], badges: ['classique'], sortOrder: 1,
          names: { fr: 'Regina', en: 'Regina', it: 'Regina', es: 'Regina' },
          descs: { fr: 'Sauce tomate, mozza, jambon et champignons frais', en: 'Tomato sauce, mozzarella, ham and fresh mushrooms', it: 'Salsa pomodoro, mozzarella, prosciutto e funghi freschi', es: 'Salsa tomate, mozzarella, jamón y champiñones frescos' } },
        { slug: 'napolitaine', price: 12.90, allergens: ['gluten', 'lactose'], badges: [], sortOrder: 2,
          names: { fr: 'Napolitaine', en: 'Neapolitan', it: 'Napoletana', es: 'Napolitana' },
          descs: { fr: 'Sauce tomate, mozza, anchois, olives, câpres', en: 'Tomato sauce, mozzarella, anchovies, olives, capers', it: 'Salsa pomodoro, mozzarella, acciughe, olive, capperi', es: 'Salsa tomate, mozzarella, anchoas, aceitunas, alcaparras' } },
        { slug: 'pecheur', price: 12.90, allergens: ['gluten', 'lactose', 'fish'], badges: [], sortOrder: 3,
          names: { fr: 'Pêcheur', en: 'Fisherman', it: 'Pescatore', es: 'Pescador' },
          descs: { fr: 'Sauce tomate, mozza, thon, oignons, olives', en: 'Tomato sauce, mozzarella, tuna, onions, olives', it: 'Salsa pomodoro, mozzarella, tonno, cipolle, olive', es: 'Salsa tomate, mozzarella, atún, cebollas, aceitunas' } },
        { slug: 'calzone', price: 11.90, allergens: ['gluten', 'lactose', 'eggs'], badges: [], sortOrder: 4,
          names: { fr: 'Calzone', en: 'Calzone', it: 'Calzone', es: 'Calzone' },
          descs: { fr: 'Sauce tomate, mozza, jambon, champignons, œuf', en: 'Tomato sauce, mozzarella, ham, mushrooms, egg', it: 'Salsa pomodoro, mozzarella, prosciutto, funghi, uovo', es: 'Salsa tomate, mozzarella, jamón, champiñones, huevo' } },
        { slug: 'diablo', price: 12.90, allergens: ['gluten', 'lactose'], badges: ['partage'], sortOrder: 5,
          names: { fr: 'Diablo', en: 'Diablo', it: 'Diablo', es: 'Diablo' },
          descs: { fr: 'Sauce tomate, mozza, salami, poivrons, piments', en: 'Tomato sauce, mozzarella, salami, peppers, chillies', it: 'Salsa pomodoro, mozzarella, salame, peperoni, peperoncini', es: 'Salsa tomate, mozzarella, salami, pimientos, chiles' } },
        { slug: 'vegetarienne', price: 11.90, allergens: ['gluten', 'lactose'], badges: ['veggie'], sortOrder: 6,
          names: { fr: 'Végétarienne', en: 'Vegetarian', it: 'Vegetariana', es: 'Vegetariana' },
          descs: { fr: 'Sauce tomate, mozza, poivrons, courgettes, aubergines', en: 'Tomato sauce, mozzarella, peppers, zucchini, eggplant', it: 'Salsa pomodoro, mozzarella, peperoni, zucchine, melanzane', es: 'Salsa tomate, mozzarella, pimientos, calabacín, berenjena' } },
        { slug: '8-fromages', price: 12.90, allergens: ['gluten', 'lactose'], badges: [], isOutOfStock: true, sortOrder: 7,
          names: { fr: '8 Fromages', en: '8 Cheese', it: '8 Formaggi', es: '8 Quesos' },
          descs: { fr: 'Sauce tomate, mozza, fromage, parmesan, gorgonzola, chèvre, emmental, brie', en: 'Tomato sauce, mozzarella, cheese, parmesan, gorgonzola, goat cheese, emmental, brie', it: 'Salsa pomodoro, mozzarella, formaggio, parmigiano, gorgonzola, caprino, emmental, brie', es: 'Salsa tomate, mozzarella, queso, parmesano, gorgonzola, cabra, emmental, brie' } },
      ];

      for (const p of products) {
        await prisma.menuItem.create({
          data: {
            categoryId: created.id,
            slug: p.slug,
            price: p.price,
            allergens: JSON.stringify(p.allergens),
            badges: JSON.stringify(p.badges),
            isVisible: true,
            isOutOfStock: p.isOutOfStock || false,
            isFeatured: p.isFeatured || false,
            sortOrder: p.sortOrder,
            translations: {
              create: Object.entries(p.names).map(([locale, name]) => ({
                locale, name, description: p.descs[locale as keyof typeof p.descs] || '',
              })),
            },
          },
        });
      }
    }
  }
  console.log('✅ Menu categories and products created');

  // ===== PROMOTIONS =====
  await prisma.promotion.deleteMany();
  const promos = [
    {
      type: 'takeaway', bgType: 'color', bgColor: '#EAF4E8', textColor: '#1F2937',
      badgeText: 'MENU MIDI', badgeColor: '#6B7280', promoPrice: 10.90,
      isVisible: true, showOnLinktree: true, showOnMenu: true, sortOrder: 0,
      titles: { fr: '1 Pizza Sénior + 1 Boisson Offerte', en: '1 Senior Pizza + 1 Free Drink', it: '1 Pizza Senior + 1 Bevanda Gratis', es: '1 Pizza Senior + 1 Bebida Gratis' },
    },
    {
      type: 'all', bgType: 'color', bgColor: '#1F2937', textColor: '#FFFFFF',
      badgeText: 'MENU MIDI SIGNATURE', badgeColor: '#374151', promoPrice: 11.90,
      isVisible: true, showOnLinktree: true, showOnMenu: true, sortOrder: 1,
      titles: { fr: '1 Pizza Signature + 1 Boisson Offerte', en: '1 Signature Pizza + 1 Free Drink', it: '1 Pizza Firma + 1 Bevanda Gratis', es: '1 Pizza Signature + 1 Bebida Gratis' },
    },
    {
      type: 'takeaway', bgType: 'color', bgColor: '#EF4444', textColor: '#FFFFFF',
      badgeText: 'OFFRE À EMPORTER', badgeColor: '#B91C1C', promoPrice: 19.90,
      isVisible: true, showOnLinktree: true, showOnMenu: true, sortOrder: 2,
      titles: { fr: '2 Pizzas Normales à Emporter', en: '2 Regular Pizzas Takeaway', it: '2 Pizze Normali da Asporto', es: '2 Pizzas Normales para Llevar' },
    },
  ];

  for (const promo of promos) {
    const { titles, ...data } = promo;
    await prisma.promotion.create({
      data: {
        ...data,
        translations: {
          create: Object.entries(titles).map(([locale, title]) => ({ locale, title })),
        },
      },
    });
  }
  console.log('✅ Promotions created');

  // ===== REVIEWS =====
  await prisma.review.deleteMany();
  const reviews = [
    { authorName: 'Sophie M.', authorInitial: 'S', avatarColor: '#EF4444', rating: 5, text: 'Pizza incroyable ! La pâte est parfaite, les ingrédients super frais. Je recommande vivement la Burratissima !', source: 'google', date: new Date('2024-03-15'), isVisible: true, sortOrder: 0 },
    { authorName: 'Thomas R.', authorInitial: 'T', avatarColor: '#3B82F6', rating: 5, text: 'Le meilleur rapport qualité/prix du 15ème. Livraison rapide et pizza encore chaude à l\'arrivée. Merci !', source: 'google', date: new Date('2024-03-10'), isVisible: true, sortOrder: 1 },
    { authorName: 'Marie L.', authorInitial: 'M', avatarColor: '#8B5CF6', rating: 4, text: 'Très bonne pizzeria artisanale. La Truffe est exceptionnelle. On reviendra sans hésiter.', source: 'google', date: new Date('2024-02-28'), isVisible: true, sortOrder: 2 },
    { authorName: 'Lucas B.', authorInitial: 'L', avatarColor: '#10B981', rating: 5, text: 'Woodiz c\'est notre pizzeria préférée ! Toujours délicieux, service au top. La Diablo est parfaite pour les amateurs de piment.', source: 'google', date: new Date('2024-02-15'), isVisible: true, sortOrder: 3 },
    { authorName: 'Clara D.', authorInitial: 'C', avatarColor: '#06B6D4', rating: 5, text: 'Pâte fine et croustillante comme en Italie. Les ingrédients sont vraiment frais. Livraison en moins de 30 min !', source: 'google', date: new Date('2024-02-01'), isVisible: true, sortOrder: 4 },
    { authorName: 'Antoine P.', authorInitial: 'A', avatarColor: '#F59E0B', rating: 5, text: 'Excellente pizza artisanale. Le four à bois fait vraiment la différence. Je conseille la Signature Mountain.', source: 'google', date: new Date('2024-01-20'), isVisible: true, sortOrder: 5 },
  ];
  await prisma.review.createMany({ data: reviews });
  console.log('✅ Reviews created');

  // ===== FAQS =====
  await prisma.fAQ.deleteMany();
  const faqs = [
    {
      sortOrder: 0, isVisible: true, showOnLinktree: true, showOnMenu: true,
      translations: [
        { locale: 'fr', question: 'Livrez-vous à domicile ?', answer: 'Oui ! Nous livrons via Uber Eats, Deliveroo et Delicity. Vous pouvez également commander directement sur notre site pour bénéficier de tarifs préférentiels.' },
        { locale: 'en', question: 'Do you deliver?', answer: 'Yes! We deliver via Uber Eats, Deliveroo and Delicity. You can also order directly on our website for preferential rates.' },
        { locale: 'it', question: 'Consegnate a domicilio?', answer: 'Sì! Consegniamo tramite Uber Eats, Deliveroo e Delicity.' },
        { locale: 'es', question: '¿Hacéis entregas a domicilio?', answer: 'Sí! Entregamos a través de Uber Eats, Deliveroo y Delicity.' },
      ],
    },
    {
      sortOrder: 1, isVisible: true, showOnLinktree: true, showOnMenu: true,
      translations: [
        { locale: 'fr', question: 'Quels sont vos horaires d\'ouverture ?', answer: 'Nous sommes ouverts du lundi au dimanche de 11h30 à 14h30 et de 18h00 à 02h00. Le lundi uniquement le soir de 18h00 à 02h00.' },
        { locale: 'en', question: 'What are your opening hours?', answer: 'We are open Monday to Sunday from 11:30 to 14:30 and from 18:00 to 02:00. Monday evening only from 18:00 to 02:00.' },
        { locale: 'it', question: 'Quali sono i vostri orari?', answer: 'Siamo aperti dal lunedì alla domenica dalle 11:30 alle 14:30 e dalle 18:00 alle 02:00.' },
        { locale: 'es', question: '¿Cuál es su horario?', answer: 'Estamos abiertos de lunes a domingo de 11:30 a 14:30 y de 18:00 a 02:00.' },
      ],
    },
    {
      sortOrder: 2, isVisible: true, showOnLinktree: false, showOnMenu: true,
      translations: [
        { locale: 'fr', question: 'Proposez-vous des pizzas sans gluten ?', answer: 'Oui, nous proposons des pâtes sans gluten sur demande. Merci de le préciser lors de votre commande.' },
        { locale: 'en', question: 'Do you offer gluten-free pizzas?', answer: 'Yes, we offer gluten-free dough on request. Please specify when ordering.' },
        { locale: 'it', question: 'Offrite pizze senza glutine?', answer: 'Sì, offriamo impasto senza glutine su richiesta.' },
        { locale: 'es', question: '¿Ofrecéis pizzas sin gluten?', answer: 'Sí, ofrecemos masa sin gluten bajo petición.' },
      ],
    },
    {
      sortOrder: 3, isVisible: true, showOnLinktree: false, showOnMenu: true,
      translations: [
        { locale: 'fr', question: 'Puis-je personnaliser ma pizza ?', answer: 'Absolument ! Appelez-nous directement pour personnaliser votre pizza selon vos goûts et allergies.' },
        { locale: 'en', question: 'Can I customize my pizza?', answer: 'Absolutely! Call us directly to customize your pizza according to your tastes and allergies.' },
        { locale: 'it', question: 'Posso personalizzare la mia pizza?', answer: 'Assolutamente! Chiamateci direttamente per personalizzare la vostra pizza.' },
        { locale: 'es', question: '¿Puedo personalizar mi pizza?', answer: 'Absolutamente! Llámanos directamente para personalizar tu pizza.' },
      ],
    },
    {
      sortOrder: 4, isVisible: true, showOnLinktree: false, showOnMenu: true,
      translations: [
        { locale: 'fr', question: 'Quelle est la taille de vos pizzas ?', answer: 'Toutes nos pizzas sont au format 31cm, cuites au four à bois traditionnel pour une pâte croustillante et moelleuse.' },
        { locale: 'en', question: 'What size are your pizzas?', answer: 'All our pizzas are 31cm, baked in a traditional wood-fired oven for a crispy and soft crust.' },
        { locale: 'it', question: 'Qual è la dimensione delle vostre pizze?', answer: 'Tutte le nostre pizze sono da 31cm, cotte nel forno a legna tradizionale.' },
        { locale: 'es', question: '¿De qué tamaño son sus pizzas?', answer: 'Todas nuestras pizzas miden 31cm, cocidas en horno de leña tradicional.' },
      ],
    },
  ];

  for (const faq of faqs) {
    const { translations, ...faqData } = faq;
    await prisma.fAQ.create({
      data: { ...faqData, translations: { create: translations } },
    });
  }
  console.log('✅ FAQs created');

  // ===== NOTIFICATION BAR =====
  await prisma.notificationBar.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1, isVisible: true, bgColor: '#1C1C1E', textColor: '#F59E0B',
      icon: '🚀', link: 'https://deliveroo.fr', linkLabel: 'J\'en profite',
      translations: {
        create: [
          { locale: 'fr', text: 'PROFITEZ DE DELIVEROO PLUS ARGENT OFFERT ! Frais de livraison OFFERTS avec Amazon Prime*' },
          { locale: 'en', text: 'GET DELIVEROO PLUS FREE MONEY! FREE delivery fees with Amazon Prime*' },
          { locale: 'it', text: 'APPROFITTA DI DELIVEROO PLUS! Spese di consegna GRATIS con Amazon Prime*' },
          { locale: 'es', text: '¡APROVECHA DELIVEROO PLUS! Gastos de envío GRATIS con Amazon Prime*' },
        ],
      },
    },
  });
  console.log('✅ Notification bar created');

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📧 Admin email:', process.env.ADMIN_EMAIL || 'admin@woodiz.fr');
  console.log('🔑 Admin password:', process.env.ADMIN_PASSWORD || 'ChangeMe123!');
  console.log('🌐 Linktree: http://localhost:3000');
  console.log('🍕 Menu: http://localhost:3000/menu');
  console.log('⚙️  Admin: http://localhost:3000/admin');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());