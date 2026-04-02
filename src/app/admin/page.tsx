import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import AdminLoginForm from '@/components/admin/AdminLoginForm';

export default async function AdminPage() {
  const session = await getSession();

  // Non connecté → formulaire de login
  if (!session) {
    return <AdminLoginForm />;
  }

  // Connecté → dashboard
  const today = new Date(new Date().toISOString().split('T')[0]);
  const [categories, products, promos, reviews, faqs, buttons, todayVisits, totalVisits, leadsCount] = await Promise.allSettled([
    prisma.menuCategory.count(),
    prisma.menuItem.count(),
    prisma.promotion.count({ where: { isVisible: true } }),
    prisma.review.count(),
    prisma.fAQ.count(),
    prisma.linktreeButton.count({ where: { isVisible: true } }),
    prisma.visit.count({ where: { createdAt: { gte: today } } }),
    prisma.visit.count(),
    prisma.lead.count(),
  ]);

  const stats = [
    { label: 'Visites aujourd\'hui', value: todayVisits.status === 'fulfilled' ? todayVisits.value : 0, icon: '📊', href: '/admin/visits',      cls: 'kpi-blue'   },
    { label: 'Visites totales',     value: totalVisits.status === 'fulfilled' ? totalVisits.value : 0, icon: '👁️', href: '/admin/visits',      cls: 'kpi-purple' },
    { label: 'Leads collectés',     value: leadsCount.status  === 'fulfilled' ? leadsCount.value  : 0, icon: '📋', href: '/admin/leads',       cls: 'kpi-green'  },
    { label: 'Produits',            value: products.status    === 'fulfilled' ? products.value    : 0, icon: '🍕', href: '/admin/menu',        cls: 'kpi-amber'  },
    { label: 'Promotions actives',  value: promos.status      === 'fulfilled' ? promos.value      : 0, icon: '🎯', href: '/admin/promotions',  cls: 'kpi-red'    },
    { label: 'Avis Google',         value: reviews.status     === 'fulfilled' ? reviews.value     : 0, icon: '⭐', href: '/admin/reviews',     cls: 'kpi-yellow' },
  ];

  const quickLinks = [
    { href: '/admin/visits',     label: 'Statistiques',    desc: 'Visites & trafic',          icon: '📊' },
    { href: '/admin/linktree',   label: 'Gérer Linktree',  desc: 'Boutons, cover, profil',   icon: '🔗' },
    { href: '/admin/menu',       label: 'Gérer le Menu',   desc: 'Catégories & produits',     icon: '🍕' },
    { href: '/admin/promotions', label: 'Promotions',      desc: 'Offres en cours',           icon: '🎯' },
    { href: '/admin/hours',      label: 'Horaires',        desc: "Horaires d'ouverture",      icon: '🕐' },
    { href: '/admin/settings',   label: 'Paramètres',      desc: 'SEO, couleurs, logo',       icon: '⚙️' },
  ];

  const now = new Date();
  const dateLabel = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="dcm-page">

      {/* ── Header ── */}
      <div className="dcm-page-header admin-fade-in">
        <div>
          <h1 className="dcm-page-title">Tableau de bord</h1>
          <p className="dcm-page-subtitle">Woodiz — Pizzeria artisanale · Paris 15</p>
        </div>
        <span className="dcm-date-chip">{dateLabel}</span>
      </div>

      {/* ── KPIs ── */}
      <section className="dcm-section">
        <p className="dcm-section-label">Vue d&apos;ensemble</p>
        <div className="dcm-kpi-grid">
          {stats.map((stat, i) => (
            <Link
              key={stat.label}
              href={stat.href}
              className={`admin-fade-in-${i + 1} dcm-kpi-card ${stat.cls}`}
            >
              <div className={`dcm-kpi-icon kpi-icon-box`}>{stat.icon}</div>
              <p className="dcm-kpi-value kpi-value">{stat.value}</p>
              <p className="dcm-kpi-label kpi-label">{stat.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Navigation rapide ── */}
      <section className="dcm-section admin-fade-in-4">
        <p className="dcm-section-label">Navigation rapide</p>
        <div className="dcm-quicklink-grid">
          {quickLinks.map(link => (
            <Link key={link.href} href={link.href} className="dcm-quicklink-card admin-quick-link group">
              <div className="dcm-quicklink-icon admin-quick-icon">{link.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="dcm-quicklink-name">{link.label}</p>
                <p className="dcm-quicklink-desc">{link.desc}</p>
              </div>
              <svg
                className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-40 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Aperçu du site ── */}
      <section className="dcm-sites-card admin-card admin-fade-in-5">
        <div className="dcm-sites-header">
          <div className="dcm-online-dot" />
          <p className="dcm-sites-title">Aperçu du site</p>
        </div>
        <div className="dcm-chips-wrap">
          {['/linktree', '/menu', '/en/linktree', '/en/menu', '/it/menu', '/es/menu'].map(path => (
            <a key={path} href={path} target="_blank" rel="noopener noreferrer" className="admin-site-chip">
              <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {path}
            </a>
          ))}
        </div>
      </section>

    </div>
  );
}
