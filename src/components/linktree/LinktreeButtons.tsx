'use client';

import Image from 'next/image';
import {
  ShoppingCart, UtensilsCrossed, MapPin, Phone, Star, Clock, Globe,
  Instagram, Youtube, Facebook, Twitter, Music2, Link2, ExternalLink,
  Heart, Gift, Ticket, Award, Truck, Coffee, Pizza, Salad, ChefHat,
  Bike, Car, Navigation, MessageCircle, Send, BookOpen, Camera,
  Percent, Tag, Flame, Leaf, Fish, Beef, Egg, Wheat, ArrowRight,
  Sparkles, Share2, Info, ShoppingBag, Zap, Home,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Button {
  id: number;
  label: string;
  url: string;
  icon?: string | null;
  iconUrl?: string | null;
  bgColor: string;
  bgGradient?: string | null;
  textColor: string;
  borderColor?: string | null;
  style: string;
  section: string;
  sortOrder: number;
  labelTranslations?: string | null;
}

interface Props {
  buttons: Button[];
  locale?: string;
}

const SECTION_META: Record<string, { label: string; Icon: LucideIcon; description: string }> = {
  commander: { label: 'Commander',     Icon: ShoppingCart,   description: 'Choisissez votre plateforme' },
  contact:   { label: 'Nous contacter',Icon: Phone,          description: 'Appelez-nous ou trouvez-nous' },
  discover:  { label: 'Découvrir',     Icon: Sparkles,       description: 'En savoir plus' },
  social:    { label: 'Réseaux',       Icon: Share2,         description: 'Suivez-nous' },
  info:      { label: 'Infos',         Icon: Info,           description: 'Informations utiles' },
};

/* Google "G" SVG multicolore — Lucide n'a pas d'icône Google */
function GoogleSVGIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

const ICON_MAP: Record<string, { Icon: LucideIcon; anim: string }> = {
  'shopping-bag':  { Icon: ShoppingBag,     anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'shopping-cart': { Icon: ShoppingCart,    anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'bag':           { Icon: ShoppingBag,     anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'ubereats':      { Icon: ShoppingCart,    anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'deliveroo':     { Icon: Bike,            anim: 'group-hover:scale-110 group-hover:-translate-x-1' },
  'delivery':      { Icon: Truck,           anim: 'group-hover:scale-110 group-hover:translate-x-1' },
  'truck':         { Icon: Truck,           anim: 'group-hover:scale-110 group-hover:translate-x-1' },
  'bike':          { Icon: Bike,            anim: 'group-hover:scale-110 group-hover:-translate-x-1' },
  'car':           { Icon: Car,             anim: 'group-hover:scale-110 group-hover:translate-x-1' },
  'food':          { Icon: UtensilsCrossed, anim: 'group-hover:scale-110 group-hover:-rotate-6' },
  'utensils':      { Icon: UtensilsCrossed, anim: 'group-hover:scale-110 group-hover:-rotate-6' },
  'menu':          { Icon: BookOpen,        anim: 'group-hover:scale-110 group-hover:rotate-3' },
  'pizza':         { Icon: Pizza,           anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'coffee':        { Icon: Coffee,          anim: 'group-hover:scale-110 group-hover:-rotate-6' },
  'salad':         { Icon: Salad,           anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'chef':          { Icon: ChefHat,         anim: 'group-hover:scale-110 group-hover:-rotate-6' },
  'fish':          { Icon: Fish,            anim: 'group-hover:scale-110 group-hover:translate-x-1' },
  'beef':          { Icon: Beef,            anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'egg':           { Icon: Egg,             anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'wheat':         { Icon: Wheat,           anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'leaf':          { Icon: Leaf,            anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'vegan':         { Icon: Leaf,            anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'flame':         { Icon: Flame,           anim: 'group-hover:scale-125 group-hover:-translate-y-1' },
  'spicy':         { Icon: Flame,           anim: 'group-hover:scale-125 group-hover:-translate-y-1' },
  'zap':           { Icon: Zap,             anim: 'group-hover:scale-125 group-hover:-translate-y-1' },
  'map':           { Icon: MapPin,          anim: 'group-hover:scale-110 group-hover:-translate-y-1' },
  'map-pin':       { Icon: MapPin,          anim: 'group-hover:scale-110 group-hover:-translate-y-1' },
  'location':      { Icon: MapPin,          anim: 'group-hover:scale-110 group-hover:-translate-y-1' },
  'navigation':    { Icon: Navigation,      anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'phone':         { Icon: Phone,           anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'message':       { Icon: MessageCircle,   anim: 'group-hover:scale-110 group-hover:-rotate-6' },
  'whatsapp':      { Icon: MessageCircle,   anim: 'group-hover:scale-110 group-hover:-rotate-6' },
  'telegram':      { Icon: Send,            anim: 'group-hover:scale-110 group-hover:translate-x-1 group-hover:-translate-y-1' },
  'instagram':     { Icon: Instagram,       anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'facebook':      { Icon: Facebook,        anim: 'group-hover:scale-110 group-hover:-rotate-6' },
  'twitter':       { Icon: Twitter,         anim: 'group-hover:scale-110 group-hover:-rotate-6' },
  'youtube':       { Icon: Youtube,         anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'tiktok':        { Icon: Music2,          anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'music':         { Icon: Music2,          anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'camera':        { Icon: Camera,          anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'globe':         { Icon: Globe,           anim: 'group-hover:scale-110 group-hover:rotate-180' },
  'website':       { Icon: Globe,           anim: 'group-hover:scale-110 group-hover:rotate-180' },
  'link':          { Icon: ExternalLink,    anim: 'group-hover:scale-110 group-hover:translate-x-0.5 group-hover:-translate-y-0.5' },
  'external':      { Icon: ExternalLink,    anim: 'group-hover:scale-110 group-hover:translate-x-0.5 group-hover:-translate-y-0.5' },
  'star':          { Icon: Star,            anim: 'group-hover:scale-125 group-hover:rotate-12' },
  'review':        { Icon: Star,            anim: 'group-hover:scale-125 group-hover:rotate-12' },
  'heart':         { Icon: Heart,           anim: 'group-hover:scale-125 group-hover:-translate-y-0.5' },
  'gift':          { Icon: Gift,            anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'ticket':        { Icon: Ticket,          anim: 'group-hover:scale-110 group-hover:rotate-3' },
  'promo':         { Icon: Percent,         anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'percent':       { Icon: Percent,         anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'tag':           { Icon: Tag,             anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'award':         { Icon: Award,           anim: 'group-hover:scale-110 group-hover:-rotate-6' },
  'clock':         { Icon: Clock,           anim: 'group-hover:scale-110 group-hover:rotate-180' },
  'hours':         { Icon: Clock,           anim: 'group-hover:scale-110 group-hover:rotate-180' },
  'home':          { Icon: Home,            anim: 'group-hover:scale-110 group-hover:-translate-y-0.5' },
  'sparkles':      { Icon: Sparkles,        anim: 'group-hover:scale-125 group-hover:rotate-12' },
  'google':        { Icon: GoogleSVGIcon as unknown as LucideIcon, anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'google-reviews':{ Icon: GoogleSVGIcon as unknown as LucideIcon, anim: 'group-hover:scale-110 group-hover:rotate-6' },
};

function resolveIcon(icon?: string | null, iconUrl?: string | null) {
  if (iconUrl) return { type: 'url' as const, iconUrl };
  if (!icon) return { type: 'default' as const };
  if (icon.startsWith('<svg') || icon.startsWith('<?xml')) return { type: 'svg' as const, svg: icon };
  const key = icon.toLowerCase().trim();
  if (ICON_MAP[key]) return { type: 'lucide' as const, ...ICON_MAP[key] };
  return { type: 'emoji' as const, emoji: icon };
}

/* ─── Icon box for full-width buttons ─── */
function IconBox({ icon, iconUrl, textColor }: { icon?: string | null; iconUrl?: string | null; textColor: string }) {
  const base = 'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300';
  const bgStyle = { background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(8px)' };
  const resolved = resolveIcon(icon, iconUrl);

  if (resolved.type === 'url') return (
    <div className={`${base} group-hover:scale-110`} style={bgStyle}>
      <Image src={resolved.iconUrl} alt="" width={20} height={20} className="object-contain" />
    </div>
  );
  if (resolved.type === 'svg') return (
    <div className={`${base} group-hover:scale-110`} style={bgStyle} dangerouslySetInnerHTML={{ __html: resolved.svg }} />
  );
  if (resolved.type === 'lucide') {
    const { Icon, anim } = resolved;
    return (
      <div className={`${base} ${anim}`} style={bgStyle}>
        <Icon className="w-5 h-5" style={{ color: textColor }} />
      </div>
    );
  }
  if (resolved.type === 'emoji') return (
    <div className={`${base} group-hover:scale-110 text-xl`} style={bgStyle}>{resolved.emoji}</div>
  );
  return (
    <div className={`${base} group-hover:scale-110`} style={bgStyle}>
      <Link2 className="w-5 h-5" style={{ color: textColor }} />
    </div>
  );
}

/* ─── Large icon for compact grid buttons ─── */
function LargeIconBox({ icon, iconUrl, textColor }: { icon?: string | null; iconUrl?: string | null; textColor: string }) {
  const resolved = resolveIcon(icon, iconUrl);
  const base = 'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 mb-1 transition-all duration-300';
  const bgStyle = { background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)' };

  if (resolved.type === 'url') return (
    <div className={`${base} group-hover:scale-110`} style={bgStyle}>
      <Image src={resolved.iconUrl} alt="" width={32} height={32} className="object-contain rounded-xl" />
    </div>
  );
  if (resolved.type === 'svg') return (
    <div className={`${base} group-hover:scale-110`} style={bgStyle} dangerouslySetInnerHTML={{ __html: resolved.svg }} />
  );
  if (resolved.type === 'lucide') {
    const { Icon, anim } = resolved;
    return (
      <div className={`${base} ${anim}`} style={bgStyle}>
        <Icon className="w-7 h-7" style={{ color: textColor }} />
      </div>
    );
  }
  if (resolved.type === 'emoji') return (
    <div className={`${base} group-hover:scale-110 text-3xl`} style={bgStyle}>{resolved.emoji}</div>
  );
  return (
    <div className={`${base} group-hover:scale-110`} style={bgStyle}>
      <Link2 className="w-7 h-7" style={{ color: textColor }} />
    </div>
  );
}

function getLabel(btn: Button, locale?: string): string {
  if (locale && btn.labelTranslations) {
    try {
      const t = JSON.parse(btn.labelTranslations);
      return t[locale] || t['fr'] || btn.label;
    } catch { /* noop */ }
  }
  return btn.label;
}

function btnStyle(btn: Button): React.CSSProperties {
  if (btn.style === 'outline') return {
    background: 'transparent',
    border: `1.5px solid ${btn.borderColor || btn.bgColor}`,
    color: btn.textColor,
  };
  if (btn.style === 'ghost') return {
    background: `${btn.bgColor}22`,
    color: btn.textColor,
    border: `1px solid ${btn.bgColor}44`,
  };
  return { background: btn.bgGradient || btn.bgColor, color: btn.textColor };
}

/* ─── Full-width button ─── */
function FullBtn({ btn, locale }: { btn: Button; locale?: string }) {
  return (
    <a
      href={btn.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center w-full rounded-2xl px-4 py-3.5 transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] overflow-hidden"
      style={btnStyle(btn)}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)' }} />
      <IconBox icon={btn.icon} iconUrl={btn.iconUrl} textColor={btn.textColor} />
      <span className="flex-1 font-bold text-sm mx-3.5 leading-tight">{getLabel(btn, locale)}</span>
      <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 group-hover:translate-x-0.5"
        style={{ background: 'rgba(255,255,255,0.18)' }}>
        <ArrowRight className="w-3.5 h-3.5" style={{ color: btn.textColor }} />
      </div>
    </a>
  );
}

/* ─── Compact card for grid layout ─── */
function CompactBtn({ btn, locale }: { btn: Button; locale?: string }) {
  return (
    <a
      href={btn.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col items-center justify-center rounded-2xl px-3 pt-5 pb-4 text-center transition-all duration-200 hover:scale-[1.04] hover:shadow-xl active:scale-[0.97] overflow-hidden"
      style={btnStyle(btn)}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, transparent 60%)' }} />
      <LargeIconBox icon={btn.icon} iconUrl={btn.iconUrl} textColor={btn.textColor} />
      <span className="font-bold text-[13px] leading-tight line-clamp-2 relative z-10 mt-1" style={{ color: btn.textColor }}>
        {getLabel(btn, locale)}
      </span>
    </a>
  );
}

export default function LinktreeButtons({ buttons, locale }: Props) {
  const sections = buttons.reduce<Record<string, Button[]>>((acc, btn) => {
    const sec = btn.section || 'main';
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(btn);
    return acc;
  }, {});

  return (
    <div className="px-4 mt-5 space-y-3">
      {Object.entries(sections).map(([section, btns]) => {
        const meta = SECTION_META[section];
        const useGrid = btns.length >= 3 && section !== 'main';

        return (
          <div
            key={section}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(12px)' }}
          >
            {/* Section header */}
            {section !== 'main' && meta?.label && (
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.10)' }}>
                  <meta.Icon className="w-3.5 h-3.5 text-white/70" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-white/80 uppercase tracking-widest leading-none">
                    {meta.label}
                  </p>
                  {meta.description && (
                    <p className="text-[10px] text-white/35 mt-0.5 leading-none">{meta.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className={useGrid ? 'grid grid-cols-2 gap-2 p-3' : 'flex flex-col gap-2 p-3'}>
              {useGrid
                ? btns.map(btn => <CompactBtn key={btn.id} btn={btn} locale={locale} />)
                : btns.map(btn => <FullBtn key={btn.id} btn={btn} locale={locale} />)
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}
