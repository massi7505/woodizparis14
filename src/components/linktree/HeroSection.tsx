'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  ArrowRight, ChevronLeft, ChevronRight, Check, Pause, Play,
  Truck, Salad, Percent, Tag, Gift, ShoppingCart, ShoppingBag,
  UtensilsCrossed, MapPin, Phone, Clock, Globe, Instagram,
  Bike, Pizza, Coffee, Flame, Leaf, Zap, Award, Sparkles,
  BookOpen, Heart, Ticket, MessageCircle, Send, Camera,
  Fish, Beef, Navigation, Home, Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { autoTextColor } from '@/lib/color';

// ── Types ────────────────────────────────────────────────
interface SlideButton {
  id: number;
  labelJson: string;
  url: string;
  icon?: string | null;
  bgColor: string;
  bgGradient?: string | null;
  bgType: string;
  textColor: string;
  style: string;
  sortOrder: number;
}

interface Slide {
  id: number;
  titleJson: string;
  subtitleJson?: string | null;
  badgesJson?: string | null;
  sideTextJson?: string | null;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  videoUrl?: string | null;
  bgColor: string;
  bgGradient?: string | null;
  bgType: string;
  photoOnly?: boolean;
  buttons: SlideButton[];
}

interface FeatureCard {
  id: number;
  titleJson: string;
  icon: string;
  bgColor: string;
  textColor: string;
  iconColor: string;
  arrowColor: string;
  url?: string | null;
}

interface HeroSettings {
  isVisible: boolean;
  autoplay: boolean;
  autoplayDelay: number;
  showDots: boolean;
  showArrows: boolean;
  ratingCount: string;
  ratingTextJson?: string | null;
  showRating: boolean;
  showFeatureCards: boolean;
  accentColor: string;
}

interface Props {
  settings: HeroSettings;
  slides: Slide[];
  featureCards: FeatureCard[];
  locale: string;
  primaryColor?: string;
}

// ── Helpers ──────────────────────────────────────────────
function t(json: string | null | undefined, locale: string, fallback = ''): string {
  if (!json) return fallback;
  try {
    const obj = JSON.parse(json);
    return obj[locale] || obj['fr'] || fallback;
  } catch {
    return fallback;
  }
}

const ICON_MAP: Record<string, LucideIcon> = {
  truck: Truck, delivery: Truck, bike: Bike, car: Truck,
  salad: Salad, food: UtensilsCrossed, utensils: UtensilsCrossed,
  percent: Percent, tag: Tag, gift: Gift, ticket: Ticket,
  'shopping-cart': ShoppingCart, 'shopping-bag': ShoppingBag,
  menu: BookOpen, pizza: Pizza, coffee: Coffee, flame: Flame, leaf: Leaf,
  vegan: Leaf, zap: Zap, 'map-pin': MapPin, map: MapPin, phone: Phone,
  clock: Clock, globe: Globe, instagram: Instagram, heart: Heart,
  fish: Fish, beef: Beef, navigation: Navigation, home: Home,
  camera: Camera, message: MessageCircle, telegram: Send,
  award: Award, sparkles: Sparkles, star: Star,
};

function SlideIcon({ icon, color, size = 20 }: { icon?: string | null; color: string; size?: number }) {
  if (!icon) return null;
  const Icon = ICON_MAP[icon.toLowerCase()];
  if (!Icon) return null;
  return <Icon style={{ color, width: size, height: size }} />;
}

function slideBg(slide: Slide): React.CSSProperties {
  if (slide.bgType === 'gradient' && slide.bgGradient) return { background: slide.bgGradient };
  return { backgroundColor: slide.bgColor };
}

// ── Progress Bar ─────────────────────────────────────────
function ProgressDots({
  total, current, paused, delay, accentColor, onGo, onTogglePause,
}: {
  total: number; current: number; paused: boolean; delay: number;
  accentColor: string; onGo: (i: number) => void; onTogglePause: () => void;
}) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
      {/* Dots */}
      <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full">
        {Array.from({ length: total }).map((_, i) => {
          const isActive = i === current;
          return (
            <button
              key={i}
              onClick={() => onGo(i)}
              className="relative overflow-hidden rounded-full transition-all duration-400"
              style={{
                width: isActive ? '20px' : '6px',
                height: '6px',
                backgroundColor: isActive ? accentColor : 'rgba(255,255,255,0.4)',
              }}
              aria-label={`Slide ${i + 1}`}
            >
              {isActive && (
                <span
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: '100%',
                    backgroundColor: accentColor,
                    transformOrigin: 'left center',
                    animation: paused ? 'none' : `hero-progress ${delay}ms linear forwards`,
                  }}
                />
              )}
            </button>
          );
        })}

        {/* Play/Pause */}
        <button
          onClick={onTogglePause}
          className="ml-1 w-5 h-5 flex items-center justify-center rounded-full transition-all hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.15)' }}
          aria-label={paused ? 'Play' : 'Pause'}
        >
          {paused
            ? <Play className="w-2.5 h-2.5 text-white" fill="white" />
            : <Pause className="w-2.5 h-2.5 text-white" fill="white" />}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function HeroSection({ settings, slides, featureCards, locale, primaryColor }: Props) {
  const accent = primaryColor || settings.accentColor || '#F59E0B';
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const total = slides.length;
  const delay = settings.autoplayDelay || 5000;

  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const go = useCallback((idx: number) => {
    if (total === 0) return;
    const next = ((idx % total) + total) % total;
    setPrev(current);
    setCurrent(next);
    setAnimKey(k => k + 1);
  }, [current, total]);

  const goPrev = useCallback(() => go(current - 1), [current, go]);
  const goNext = useCallback(() => go(current + 1), [current, go]);

  useEffect(() => {
    if (!settings.autoplay || total <= 1 || paused) return;
    const timer = setInterval(() => {
      setCurrent(c => {
        const next = (c + 1) % total;
        setPrev(c);
        setAnimKey(k => k + 1);
        return next;
      });
    }, delay);
    return () => clearInterval(timer);
  }, [settings.autoplay, delay, total, paused]);

  useEffect(() => {
    if (prev === null) return;
    const id = setTimeout(() => setPrev(null), 700);
    return () => clearTimeout(id);
  }, [prev, current]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
  }, []);
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (dragStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) goNext(); else goPrev();
  }, [goNext, goPrev]);
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    isDragging.current = false;
  }, []);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragStartX.current === null) return;
    if (Math.abs(e.clientX - dragStartX.current) > 8) isDragging.current = true;
  }, []);
  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (!isDragging.current || Math.abs(delta) < 40) { isDragging.current = false; return; }
    isDragging.current = false;
    if (delta < 0) goNext(); else goPrev();
  }, [goNext, goPrev]);
  const onMouseLeave = useCallback(() => {
    dragStartX.current = null;
    isDragging.current = false;
  }, []);

  if (!settings.isVisible || total === 0) return null;

  const slide = slides[current];
  const title = t(slide.titleJson, locale);
  const subtitle = t(slide.subtitleJson, locale);
  const sideText = t(slide.sideTextJson, locale);
  const ratingText = t(settings.ratingTextJson, locale);

  let badges: { fr?: string; en?: string; it?: string; es?: string }[] = [];
  try { if (slide.badgesJson) badges = JSON.parse(slide.badgesJson); } catch { /* noop */ }

  return (
    <section className="w-full">
      {/* ── Hero container — full bleed mobile, rounded desktop ── */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none rounded-2xl md:rounded-3xl aspect-[4/3] sm:aspect-video md:aspect-[5/2] lg:aspect-[3/1]"
        style={{ ...slideBg(slide), cursor: isDragging.current ? 'grabbing' : 'grab' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        {/* ── Photo-only mode ── */}
        {slide.photoOnly ? (
          <>
            {slide.imageUrl && (
              <div
                key={`photo-desk-${current}-${animKey}`}
                className={`absolute inset-0 hero-anim-overlay${slide.mobileImageUrl ? ' hidden md:block' : ''}`}
              >
                <Image src={slide.imageUrl} alt="" fill priority
                  sizes="(max-width: 1280px) 100vw, 1400px" quality={80}
                  className="object-cover object-center pointer-events-none"
                  draggable={false}
                />
              </div>
            )}
            {slide.mobileImageUrl && (
              <div key={`photo-mob-${current}-${animKey}`} className="absolute inset-0 hero-anim-overlay md:hidden">
                <Image src={slide.mobileImageUrl} alt="" fill priority
                  sizes="100vw" quality={80}
                  className="object-cover object-center pointer-events-none"
                  draggable={false}
                />
              </div>
            )}
            <div className="absolute inset-0" />
          </>
        ) : (
          <>
            {/* Prev slide fading out */}
            {prev !== null && slides[prev] && (
              <div key={`prev-${prev}`} className="absolute inset-0 hero-anim-out" style={{ zIndex: 1 }}>
                {slides[prev].videoUrl ? (
                  <video src={slides[prev].videoUrl!} autoPlay loop muted playsInline
                    className="w-full h-full object-cover pointer-events-none" />
                ) : slides[prev].imageUrl ? (
                  <Image src={slides[prev].imageUrl!} alt="" fill sizes="100vw" quality={55}
                    className="object-cover pointer-events-none" draggable={false} />
                ) : null}
                {/* Overlay */}
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.92) 100%)' }} />
              </div>
            )}

            {/* Current slide */}
            <div key={`curr-${current}-${animKey}`} className="absolute inset-0 hero-anim-overlay" style={{ zIndex: 2 }}>
              {slide.videoUrl ? (
                <>
                  <video src={slide.videoUrl} autoPlay loop muted playsInline
                    className="w-full h-full object-cover pointer-events-none" />
                </>
              ) : slide.imageUrl ? (
                <Image src={slide.imageUrl} alt="" fill priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1400px"
                  quality={80} className="object-cover pointer-events-none" draggable={false}
                />
              ) : (
                <div className="absolute inset-0" style={slideBg(slide)} />
              )}
              {/* Cinematic gradient: transparent top → dark bottom + left vignette */}
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.65) 65%, rgba(0,0,0,0.93) 100%)',
              }} />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 55%)',
              }} />
            </div>

            {/* ── Content ── */}
            <div
              key={animKey}
              className="absolute inset-0 flex flex-col justify-end p-5 pb-14 md:p-10 md:pb-16"
              style={{ zIndex: 10 }}
            >
              {/* Rating badge — top left */}
              {settings.showRating && settings.ratingCount && (
                <div className="hero-anim-0 mb-4 inline-flex w-fit">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: `${accent}22`, border: `1px solid ${accent}55`, backdropFilter: 'blur(8px)' }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className="w-3 h-3" style={{ color: accent }} fill={accent} />
                    ))}
                    <span className="text-white text-xs font-bold ml-1">{settings.ratingCount}</span>
                    {ratingText && <span className="text-white/60 text-xs">{ratingText}</span>}
                  </div>
                </div>
              )}

              {/* Accent line — only if there's actual text content */}
              {title && (
                <div className="hero-anim-0 mb-3">
                  <span className="h-[3px] w-10 rounded-full inline-block" style={{ backgroundColor: accent }} />
                </div>
              )}

              {/* Badges */}
              {badges.length > 0 && (
                <div className="hero-anim-0 flex flex-wrap gap-2 mb-3">
                  {badges.map((badge, i) => {
                    const text = badge[locale as keyof typeof badge] || badge.fr || '';
                    if (!text) return null;
                    return (
                      <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                        style={{ background: `${accent}25`, border: `1px solid ${accent}50`, backdropFilter: 'blur(4px)' }}>
                        <Check className="w-3 h-3 flex-shrink-0" style={{ color: accent }} />
                        <span className="text-white text-xs font-semibold tracking-wide">{text}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Title */}
              <h1
                className="hero-anim-1 text-white font-black leading-[0.92] tracking-tight mb-3"
                style={{
                  fontSize: 'clamp(2.4rem, 8.5vw, 4.8rem)',
                  textShadow: '0 2px 30px rgba(0,0,0,0.5)',
                }}
              >
                {title}
              </h1>

              {/* Subtitle */}
              {subtitle && (
                <p className="hero-anim-2 text-white/75 text-sm md:text-base mb-3 leading-relaxed font-medium max-w-md">
                  {subtitle}
                </p>
              )}

              {/* Side text */}
              {sideText && (
                <p className="hero-anim-3 text-white/45 text-sm mb-3 leading-relaxed italic">
                  {sideText}
                </p>
              )}

              {/* CTA Buttons */}
              {slide.buttons.length > 0 && (
                <div className="hero-anim-4 flex flex-wrap gap-2.5 mt-1">
                  {slide.buttons.map(btn => {
                    const isPrimary = btn.style !== 'outline' && btn.style !== 'ghost';
                    const bg = btn.bgGradient || btn.bgColor || accent;
                    const fg = btn.textColor || autoTextColor(bg);
                    const style: React.CSSProperties = btn.style === 'outline'
                      ? { background: 'transparent', border: `2px solid ${bg}`, color: fg }
                      : btn.style === 'ghost'
                      ? { background: `${bg}22`, border: `1px solid ${bg}44`, color: fg, backdropFilter: 'blur(8px)' }
                      : { background: btn.bgGradient || bg, color: fg };

                    return (
                      <a
                        key={btn.id}
                        href={btn.url}
                        target={btn.url.startsWith('http') ? '_blank' : undefined}
                        rel={btn.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 hover:shadow-xl shadow-md"
                        style={style}
                        onClick={e => { if (isDragging.current) e.preventDefault(); }}
                      >
                        {btn.icon && <SlideIcon icon={btn.icon} color={fg} size={15} />}
                        {t(btn.labelJson, locale, 'Commander')}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Nav arrows — desktop only ── */}
        {total > 1 && settings.showArrows && (
          <>
            <button onClick={goPrev} aria-label="Précédent"
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center transition-all hover:scale-110 active:scale-95 z-20"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button onClick={goNext} aria-label="Suivant"
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center transition-all hover:scale-110 active:scale-95 z-20"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* ── Progress dots — centered ── */}
        {total > 1 && settings.showDots && (
          <ProgressDots
            key={animKey}
            total={total}
            current={current}
            paused={paused}
            delay={delay}
            accentColor={accent}
            onGo={go}
            onTogglePause={() => setPaused(p => !p)}
          />
        )}

        {/* Slide index — top right */}
        {total > 1 && (
          <div className="absolute top-4 right-4 z-20 text-xs font-bold tabular-nums px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.7)' }}>
            {current + 1}<span className="opacity-50">/{total}</span>
          </div>
        )}
      </div>

      {/* ── Feature Cards ── */}
      {settings.showFeatureCards && featureCards.length > 0 && (
        <div
          className="flex gap-2.5 mt-3 overflow-x-auto pb-1 md:grid md:overflow-visible md:pb-0"
          style={{
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            gridTemplateColumns: `repeat(${Math.min(featureCards.length, 4)}, 1fr)`,
          }}
        >
          {featureCards.map(card => {
            const cardTitle = t(card.titleJson, locale);
            const Inner = (
              <div
                className="relative flex items-center gap-3 p-3.5 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98] cursor-pointer overflow-hidden flex-shrink-0 md:flex-shrink"
                style={{
                  backgroundColor: card.bgColor,
                  scrollSnapAlign: 'start',
                  minWidth: '150px',
                  width: 'calc(44vw)',
                  maxWidth: '220px',
                }}
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${card.iconColor}20` }}>
                  <SlideIcon icon={card.icon} color={card.iconColor} size={18} />
                </div>

                {/* Text */}
                <p className="font-bold text-xs leading-snug flex-1 line-clamp-2"
                  style={{ color: card.textColor }}>
                  {cardTitle}
                </p>

                {/* Arrow */}
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${card.arrowColor}20` }}>
                  <ArrowRight className="w-3 h-3" style={{ color: card.arrowColor }} />
                </div>
              </div>
            );

            if (card.url) return (
              <a key={card.id} href={card.url}
                target={card.url.startsWith('http') ? '_blank' : undefined}
                rel={card.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex-shrink-0 md:flex-shrink"
                style={{ scrollSnapAlign: 'start' }}>
                {Inner}
              </a>
            );
            return <div key={card.id} className="flex-shrink-0 md:flex-shrink">{Inner}</div>;
          })}
        </div>
      )}
    </section>
  );
}
