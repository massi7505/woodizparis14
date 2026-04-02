import Image from 'next/image';

interface Props {
  site: any;
  locale: string;
  primaryColor: string;
  orderLinks?: { label: string; url: string }[];
}

const LABELS: Record<string, { tag: string; title: string; subtitle: string; cta: string }> = {
  fr: {
    tag: 'Commander en ligne',
    title: 'Commandez notre\nnourriture facilement',
    subtitle: 'Retrouvez toute notre carte sur vos plateformes de livraison préférées et régalez-vous en quelques clics.',
    cta: 'Voir notre carte',
  },
  en: {
    tag: 'Order online',
    title: 'Order our food\neasily online',
    subtitle: 'Find our full menu on your favourite delivery platforms and enjoy your meal in just a few clicks.',
    cta: 'View our menu',
  },
  it: {
    tag: 'Ordina online',
    title: 'Ordina il nostro\ncibo facilmente',
    subtitle: 'Trova il nostro menu completo sulle tue piattaforme preferite e goditi il pasto in pochi clic.',
    cta: 'Vedi il menu',
  },
  es: {
    tag: 'Pedir online',
    title: 'Pide nuestra\ncomida fácilmente',
    subtitle: 'Encuentra nuestro menú completo en tus plataformas favoritas y disfruta en pocos clics.',
    cta: 'Ver nuestra carta',
  },
};

const PLATFORM_ICONS: [string, string][] = [
  ['uber', '🚗'],
  ['deliveroo', '🛵'],
  ['just eat', '🍽️'],
  ['justeat', '🍽️'],
  ['delicity', '📱'],
  ['glovo', '🟡'],
];

function platformIcon(label: string): string {
  const key = label.toLowerCase();
  for (const [k, v] of PLATFORM_ICONS) {
    if (key.includes(k)) return v;
  }
  return '📦';
}

export default function AppOrderSection({ site, locale, primaryColor, orderLinks = [] }: Props) {
  const L = LABELS[locale] || LABELS.fr;

  return (
    <section style={{ backgroundColor: '#0f172a' }} className="relative overflow-hidden">
      {/* Ambient glows */}
      <div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ backgroundColor: primaryColor, opacity: 0.06, filter: 'blur(80px)' }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full pointer-events-none"
        style={{ backgroundColor: primaryColor, opacity: 0.04, filter: 'blur(64px)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* ── Text side ── */}
          <div>
            {/* Tag pill */}
            <span
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
              style={{ backgroundColor: `${primaryColor}22`, color: primaryColor }}
            >
              {L.tag}
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-5 whitespace-pre-line">
              {L.title}
            </h2>

            <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-sm">{L.subtitle}</p>

            {/* Platform buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              {orderLinks.length > 0
                ? orderLinks
                    .filter(link => {
                      const l = link.label.toLowerCase();
                      return !l.includes('itinéraire') && !l.includes('maps') && !l.includes('adresse') && !l.includes('localisation');
                    })
                    .slice(0, 4)
                    .map(link => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl text-white font-bold text-sm transition-all hover:scale-105 hover:shadow-xl"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <span className="text-base">{platformIcon(link.label)}</span>
                      <span>{link.label}</span>
                    </a>
                  ))
                : (
                  <a
                    href="/menu"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm transition-all hover:scale-105 hover:shadow-xl"
                    style={{ backgroundColor: primaryColor, color: '#111827' }}
                  >
                    {L.cta}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
            </div>
          </div>

          {/* ── Visual side ── */}
          <div className="flex justify-center md:justify-end">
            {site?.logoUrl ? (
              <div
                className="relative flex items-center justify-center"
                style={{ width: 260, height: 260 }}
              >
                {/* Glow ring */}
                <div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: `radial-gradient(circle, ${primaryColor}30 0%, transparent 70%)`,
                    filter: 'blur(20px)',
                  }}
                />
                {/* Card */}
                <div
                  className="relative w-56 h-56 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${primaryColor}30`,
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <Image
                    src={site.logoUrl}
                    alt={site?.siteName || ''}
                    width={130}
                    height={130}
                    className="object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            ) : site?.heroImageUrl ? (
              <div className="relative w-64 h-64 rounded-3xl overflow-hidden shadow-2xl" style={{ border: `1px solid ${primaryColor}20` }}>
                <Image src={site.heroImageUrl} alt="" fill className="object-cover" />
              </div>
            ) : (
              /* Decorative food grid */
              <div className="grid grid-cols-2 gap-3">
                {['🍕', '🍔', '🥗', '🍟'].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-28 h-28 md:w-32 md:h-32 rounded-2xl flex items-center justify-center text-4xl"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.09)',
                    }}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
