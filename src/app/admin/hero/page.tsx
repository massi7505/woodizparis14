'use client';

import { useState, useEffect } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';
import ColorPicker from '@/components/admin/ColorPicker';
import { ChevronSortUpIcon, ChevronSortDownIcon, EditIcon, TrashIcon, CloseIcon } from '@/components/ui/icons';
import {
  Truck, Salad, Percent, Tag, Gift, ShoppingCart, ShoppingBag,
  UtensilsCrossed, MapPin, Phone, Clock, Globe, Instagram,
  Bike, Pizza, Coffee, Flame, Leaf, Zap, Award, Sparkles,
  BookOpen, Heart, Ticket, MessageCircle, Send, Camera, ArrowRight,
  Fish, Beef, Navigation, Home, Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ALL_LOCALES = [
  { code: 'fr', label: '🇫🇷 FR' },
  { code: 'en', label: '🇬🇧 EN' },
  { code: 'it', label: '🇮🇹 IT' },
  { code: 'es', label: '🇪🇸 ES' },
];

const ICON_OPTIONS: { key: string; Icon: LucideIcon; label: string }[] = [
  { key: 'truck',          Icon: Truck,           label: 'Livraison' },
  { key: 'bike',           Icon: Bike,            label: 'Vélo' },
  { key: 'salad',          Icon: Salad,           label: 'Salade' },
  { key: 'percent',        Icon: Percent,         label: 'Promo %' },
  { key: 'tag',            Icon: Tag,             label: 'Tag' },
  { key: 'gift',           Icon: Gift,            label: 'Cadeau' },
  { key: 'ticket',         Icon: Ticket,          label: 'Ticket' },
  { key: 'shopping-cart',  Icon: ShoppingCart,    label: 'Panier' },
  { key: 'shopping-bag',   Icon: ShoppingBag,     label: 'Sac' },
  { key: 'food',           Icon: UtensilsCrossed, label: 'Repas' },
  { key: 'menu',           Icon: BookOpen,        label: 'Menu' },
  { key: 'pizza',          Icon: Pizza,           label: 'Pizza' },
  { key: 'coffee',         Icon: Coffee,          label: 'Café' },
  { key: 'flame',          Icon: Flame,           label: 'Épicé' },
  { key: 'leaf',           Icon: Leaf,            label: 'Végé' },
  { key: 'zap',            Icon: Zap,             label: 'Flash' },
  { key: 'award',          Icon: Award,           label: 'Prix' },
  { key: 'sparkles',       Icon: Sparkles,        label: 'Éclat' },
  { key: 'map-pin',        Icon: MapPin,          label: 'Lieu' },
  { key: 'phone',          Icon: Phone,           label: 'Tél' },
  { key: 'clock',          Icon: Clock,           label: 'Horaires' },
  { key: 'globe',          Icon: Globe,           label: 'Web' },
  { key: 'instagram',      Icon: Instagram,       label: 'Insta' },
  { key: 'heart',          Icon: Heart,           label: 'Cœur' },
  { key: 'message',        Icon: MessageCircle,   label: 'Message' },
  { key: 'telegram',       Icon: Send,            label: 'Telegram' },
  { key: 'camera',         Icon: Camera,          label: 'Photo' },
  { key: 'fish',           Icon: Fish,            label: 'Poisson' },
  { key: 'beef',           Icon: Beef,            label: 'Viande' },
  { key: 'navigation',     Icon: Navigation,      label: 'GPS' },
  { key: 'home',           Icon: Home,            label: 'Accueil' },
  { key: 'star',           Icon: Star,            label: 'Étoile' },
];

const GRADIENT_PRESETS = [
  { label: 'Nuit', value: 'linear-gradient(135deg, #1F2937, #111827)' },
  { label: 'Prune', value: 'linear-gradient(135deg, #2D1B69, #1e1b4b)' },
  { label: 'Feu', value: 'linear-gradient(135deg, #F59E0B, #EF4444)' },
  { label: 'Coucher', value: 'linear-gradient(135deg, #F97316, #EC4899)' },
  { label: 'Océan', value: 'linear-gradient(135deg, #06B6D4, #3B82F6)' },
  { label: 'Forêt', value: 'linear-gradient(135deg, #22C55E, #14B8A6)' },
];

const DEFAULT_SETTINGS = {
  isVisible: true,
  autoplay: true,
  autoplayDelay: 5000,
  showDots: true,
  showArrows: true,
  ratingCount: '3,500+',
  ratingTextJson: '{"fr":"Avis","en":"Rating","it":"Valutazione","es":"Valoración"}',
  showRating: true,
  showFeatureCards: true,
  accentColor: '#F59E0B',
};

const DEFAULT_SLIDE = {
  titleJson: '{"fr":"","en":"","it":"","es":""}',
  subtitleJson: '{"fr":"","en":"","it":"","es":""}',
  badgesJson: '[]',
  sideTextJson: '{"fr":"","en":"","it":"","es":""}',
  imageUrl: '',
  mobileImageUrl: '',
  videoUrl: '',
  bgColor: '#1F2937',
  bgGradient: '',
  bgType: 'color',
  photoOnly: false,
  isVisible: true,
};

const DEFAULT_BUTTON = {
  labelJson: '{"fr":"","en":"","it":"","es":""}',
  url: '#',
  icon: '',
  bgColor: '#F59E0B',
  bgGradient: '',
  bgType: 'color',
  textColor: '#FFFFFF',
  style: 'filled',
};

const DEFAULT_CARD = {
  titleJson: '{"fr":"","en":"","it":"","es":""}',
  icon: 'truck',
  bgColor: '#FEF08A',
  textColor: '#1F2937',
  iconColor: '#1F2937',
  arrowColor: '#F59E0B',
  url: '',
  isVisible: true,
};

function parseJson(s: string | undefined | null, fallback: Record<string, string> = {}): Record<string, string> {
  try { return s ? JSON.parse(s) : fallback; } catch { return fallback; }
}

function setJsonKey(current: string | undefined | null, key: string, value: string): string {
  const obj = parseJson(current);
  obj[key] = value;
  return JSON.stringify(obj);
}

type Tab = 'slides' | 'cards' | 'settings';

export default function AdminHeroPage() {
  const [tab, setTab] = useState<Tab>('slides');
  const [slides, setSlides] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(DEFAULT_SETTINGS);
  const [editingSlide, setEditingSlide] = useState<any | null>(null);
  const [isNewSlide, setIsNewSlide] = useState(false);
  const [editingCard, setEditingCard] = useState<any | null>(null);
  const [isNewCard, setIsNewCard] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [localeBtnTab, setLocaleBtnTab] = useState('fr');
  const [localeCardTab, setLocaleCardTab] = useState('fr');
  const [editingBtnIdx, setEditingBtnIdx] = useState<number | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function load() {
    const res = await fetch('/api/hero/admin');
    if (!res.ok) return;
    const data = await res.json();
    setSlides(data.slides || []);
    setCards(data.featureCards || []);
    if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
  }
  useEffect(() => { load(); }, []);

  // ── Slides CRUD ──
  async function saveSlide() {
    if (!editingSlide) return;
    setSaving(true);
    try {
      if (isNewSlide) {
        const { id: _id, createdAt: _ca, updatedAt: _ua, buttons, ...slideData } = editingSlide;
        const res = await fetch('/api/hero', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'slide', ...slideData }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const newSlide = await res.json();
        // Save buttons
        for (const btn of (buttons || [])) {
          const { id: _bid, bgType: _bt, ...btnData } = btn;
          await fetch('/api/hero', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'button', slideId: newSlide.id, ...btnData }),
          });
        }
        showToast('✅ Slide créé');
      } else {
        const { buttons, ...slideData } = editingSlide;
        const res = await fetch(`/api/hero/${editingSlide.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'slide', ...slideData }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        showToast('✅ Slide sauvegardé');
      }
      setEditingSlide(null);
      load();
    } catch (e) { showToast(`❌ Erreur: ${e instanceof Error ? e.message : 'inconnue'}`); }
    setSaving(false);
  }

  async function deleteSlide(id: number) {
    if (!confirm('Supprimer ce slide ?')) return;
    await fetch(`/api/hero/${id}?type=slide`, { method: 'DELETE' });
    setSlides(s => s.filter(x => x.id !== id));
    showToast('🗑️ Slide supprimé');
  }

  async function moveSlide(i: number, dir: -1 | 1) {
    const arr = [...slides];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    const items = arr.map((s, idx) => ({ id: s.id, sortOrder: idx }));
    await fetch('/api/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'heroSlide', items }),
    });
    load();
  }

  // ── Cards CRUD ──
  async function saveCard() {
    if (!editingCard) return;
    setSaving(true);
    try {
      if (isNewCard) {
        const { id: _id, createdAt: _ca, updatedAt: _ua, ...cardData } = editingCard;
        const res = await fetch('/api/hero', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'card', ...cardData }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        showToast('✅ Carte créée');
      } else {
        const res = await fetch(`/api/hero/${editingCard.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'card', ...editingCard }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        showToast('✅ Carte sauvegardée');
      }
      setEditingCard(null);
      load();
    } catch (e) { showToast(`❌ Erreur: ${e instanceof Error ? e.message : 'inconnue'}`); }
    setSaving(false);
  }

  async function deleteCard(id: number) {
    if (!confirm('Supprimer cette carte ?')) return;
    await fetch(`/api/hero/${id}?type=card`, { method: 'DELETE' });
    setCards(c => c.filter(x => x.id !== id));
    showToast('🗑️ Carte supprimée');
  }

  async function moveCard(i: number, dir: -1 | 1) {
    const arr = [...cards];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    const items = arr.map((c, idx) => ({ id: c.id, sortOrder: idx }));
    await fetch('/api/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'heroCard', items }),
    });
    load();
  }

  // ── Settings ──
  async function saveSettings() {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'settings', ...settings }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast('✅ Paramètres sauvegardés');
    } catch (e) { showToast(`❌ Erreur: ${e instanceof Error ? e.message : 'inconnue'}`); }
    setSavingSettings(false);
  }

  // ── Slide button helpers ──
  function addSlideBtn() {
    const btn = { ...DEFAULT_BUTTON, id: Date.now(), sortOrder: (editingSlide?.buttons || []).length };
    setEditingSlide((s: any) => ({ ...s, buttons: [...(s.buttons || []), btn] }));
    setEditingBtnIdx((editingSlide?.buttons || []).length);
  }

  function updateBtn(idx: number, field: string, value: string) {
    setEditingSlide((s: any) => {
      const btns = [...(s.buttons || [])];
      btns[idx] = { ...btns[idx], [field]: value };
      return { ...s, buttons: btns };
    });
  }

  function removeBtn(idx: number) {
    setEditingSlide((s: any) => ({
      ...s,
      buttons: (s.buttons || []).filter((_: any, i: number) => i !== idx),
    }));
    if (editingBtnIdx === idx) setEditingBtnIdx(null);
  }

  // ── Badge helpers ──
  function addBadge() {
    const current = (() => { try { return JSON.parse(editingSlide?.badgesJson || '[]'); } catch { return []; } })();
    current.push({ fr: '', en: '', it: '', es: '' });
    setEditingSlide((s: any) => ({ ...s, badgesJson: JSON.stringify(current) }));
  }

  function updateBadge(idx: number, locale: string, value: string) {
    const current = (() => { try { return JSON.parse(editingSlide?.badgesJson || '[]'); } catch { return []; } })();
    current[idx] = { ...current[idx], [locale]: value };
    setEditingSlide((s: any) => ({ ...s, badgesJson: JSON.stringify(current) }));
  }

  function removeBadge(idx: number) {
    const current = (() => { try { return JSON.parse(editingSlide?.badgesJson || '[]'); } catch { return []; } })();
    current.splice(idx, 1);
    setEditingSlide((s: any) => ({ ...s, badgesJson: JSON.stringify(current) }));
  }

  const slideTitle = (slide: any) => {
    const t = parseJson(slide.titleJson);
    return t.fr || t.en || Object.values(t)[0] || '—';
  };

  const cardTitle = (card: any) => {
    const t = parseJson(card.titleJson);
    return t.fr || t.en || Object.values(t)[0] || '—';
  };

  return (
    <div className="dcm-page">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="dcm-page-header admin-fade-in">
        <div>
          <h1 className="dcm-page-title">🦸 Hero Section</h1>
          <p className="dcm-page-subtitle">Gérer le slider hero et les cartes fonctionnalités</p>
        </div>
        <a href="/linktree" target="_blank" rel="noopener noreferrer"
          className="text-xs px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors font-mono">
          👁️ Aperçu
        </a>
      </div>

      {/* Tabs */}
      <div className="dcm-tabs-loose">
        {(['slides', 'cards', 'settings'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`dcm-tab-loose${tab === t ? ' active' : ''}`}>
            {t === 'slides' ? '🖼️ Slides' : t === 'cards' ? '🃏 Cartes' : '⚙️ Paramètres'}
          </button>
        ))}
      </div>

      {/* ── SLIDES TAB ── */}
      {tab === 'slides' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => { setEditingSlide({ ...DEFAULT_SLIDE, buttons: [] }); setIsNewSlide(true); }}
              className="admin-btn-primary">
              + Ajouter un slide
            </button>
          </div>
          <div className="space-y-2">
            {slides.length === 0 && (
              <div className="admin-card text-center text-gray-500 py-12">
                Aucun slide. Ajoutez votre premier slide hero.
              </div>
            )}
            {slides.map((slide, i) => (
              <div key={slide.id} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${slide.isVisible ? 'border-gray-700 bg-gray-800' : 'border-gray-800 bg-gray-900 opacity-60'}`}>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveSlide(i, -1)} className="text-gray-600 hover:text-gray-300 p-0.5">
                    <ChevronSortUpIcon />
                  </button>
                  <button onClick={() => moveSlide(i, 1)} className="text-gray-600 hover:text-gray-300 p-0.5">
                    <ChevronSortDownIcon />
                  </button>
                </div>
                <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden border border-gray-600"
                  style={slide.bgType === 'gradient' && slide.bgGradient ? { background: slide.bgGradient } : { background: slide.bgColor }}>
                  {slide.imageUrl && (
                    <img src={slide.imageUrl} alt="" className="w-full h-full object-cover opacity-60" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{slideTitle(slide)}</p>
                    {slide.photoOnly && (
                      <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        📷 Photo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{slide.buttons?.length || 0} bouton(s){slide.mobileImageUrl ? ' · image mobile ✓' : ''}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingSlide({ ...slide, buttons: slide.buttons || [] }); setIsNewSlide(false); setEditingBtnIdx(null); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                    <EditIcon />
                  </button>
                  <button onClick={() => deleteSlide(slide.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── CARDS TAB ── */}
      {tab === 'cards' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => { setEditingCard({ ...DEFAULT_CARD }); setIsNewCard(true); }}
              className="admin-btn-primary">
              + Ajouter une carte
            </button>
          </div>
          <div className="space-y-2">
            {cards.length === 0 && (
              <div className="admin-card text-center text-gray-500 py-12">
                Aucune carte. Ajoutez des cartes fonctionnalités (ex: Livraison, Menu frais...).
              </div>
            )}
            {cards.map((card, i) => (
              <div key={card.id} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${card.isVisible ? 'border-gray-700 bg-gray-800' : 'border-gray-800 bg-gray-900 opacity-60'}`}>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveCard(i, -1)} className="text-gray-600 hover:text-gray-300 p-0.5">
                    <ChevronSortUpIcon />
                  </button>
                  <button onClick={() => moveCard(i, 1)} className="text-gray-600 hover:text-gray-300 p-0.5">
                    <ChevronSortDownIcon />
                  </button>
                </div>
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: card.bgColor }}>
                  <ArrowRight className="w-5 h-5" style={{ color: card.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{cardTitle(card)}</p>
                  <p className="text-xs text-gray-500">Icône: {card.icon}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingCard({ ...card }); setIsNewCard(false); setLocaleCardTab('fr'); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                    <EditIcon />
                  </button>
                  <button onClick={() => deleteCard(card.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── SETTINGS TAB ── */}
      {tab === 'settings' && (
        <div className="space-y-6">
          <div className="admin-card space-y-4">
            <h2 className="font-bold text-white">👁️ Visibilité</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={!!settings.isVisible}
                onChange={e => setSettings((s: any) => ({ ...s, isVisible: e.target.checked }))}
                className="accent-amber-500 w-4 h-4" />
              <span className="text-sm text-white">Afficher la section Hero</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={!!settings.showFeatureCards}
                onChange={e => setSettings((s: any) => ({ ...s, showFeatureCards: e.target.checked }))}
                className="accent-amber-500 w-4 h-4" />
              <span className="text-sm text-white">Afficher les cartes fonctionnalités</span>
            </label>
          </div>

          <div className="admin-card space-y-4">
            <h2 className="font-bold text-white">🎠 Slider</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={!!settings.autoplay}
                onChange={e => setSettings((s: any) => ({ ...s, autoplay: e.target.checked }))}
                className="accent-amber-500 w-4 h-4" />
              <span className="text-sm text-white">Défilement automatique</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Délai (ms)</label>
              <input type="number" value={settings.autoplayDelay || 5000} min={1000} max={15000} step={500}
                onChange={e => setSettings((s: any) => ({ ...s, autoplayDelay: parseInt(e.target.value) }))}
                className="admin-input max-w-[160px]" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!settings.showDots}
                  onChange={e => setSettings((s: any) => ({ ...s, showDots: e.target.checked }))}
                  className="accent-amber-500 w-4 h-4" />
                <span className="text-sm text-white">Points</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!settings.showArrows}
                  onChange={e => setSettings((s: any) => ({ ...s, showArrows: e.target.checked }))}
                  className="accent-amber-500 w-4 h-4" />
                <span className="text-sm text-white">Flèches</span>
              </label>
            </div>
          </div>

          <div className="admin-card space-y-4">
            <h2 className="font-bold text-white">⭐ Avis / Rating</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={!!settings.showRating}
                onChange={e => setSettings((s: any) => ({ ...s, showRating: e.target.checked }))}
                className="accent-amber-500 w-4 h-4" />
              <span className="text-sm text-white">Afficher le rating</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre d&apos;avis</label>
              <input type="text" value={settings.ratingCount || ''} placeholder="3,500+"
                onChange={e => setSettings((s: any) => ({ ...s, ratingCount: e.target.value }))}
                className="admin-input max-w-[160px]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Texte du rating (par langue)</label>
              <div className="space-y-2">
                {ALL_LOCALES.map(({ code, label }) => {
                  const vals = parseJson(settings.ratingTextJson);
                  return (
                    <div key={code} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-10 flex-shrink-0">{label}</span>
                      <input type="text" value={vals[code] || ''}
                        onChange={e => setSettings((s: any) => ({
                          ...s,
                          ratingTextJson: setJsonKey(s.ratingTextJson, code, e.target.value),
                        }))}
                        className="admin-input text-sm py-1.5" placeholder={code === 'fr' ? 'Avis' : 'Rating'} />
                    </div>
                  );
                })}
              </div>
            </div>
            <ColorPicker label="Couleur d'accentuation" value={settings.accentColor}
              onChange={c => setSettings((s: any) => ({ ...s, accentColor: c }))} />
          </div>

          <button onClick={saveSettings} disabled={savingSettings}
            className="admin-btn-primary w-full py-3 disabled:opacity-50">
            {savingSettings ? 'Sauvegarde...' : '💾 Sauvegarder les paramètres'}
          </button>
        </div>
      )}

      {/* ── SLIDE MODAL ── */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
              <h2 className="font-bold text-white">{isNewSlide ? '+ Nouveau slide' : '✏️ Modifier le slide'}</h2>
              <button onClick={() => setEditingSlide(null)}><CloseIcon /></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Locale tabs */}
              <div>
                <div className="flex gap-1 mb-3">
                  {ALL_LOCALES.map(({ code, label }) => (
                    <button key={code} onClick={() => setLocaleBtnTab(code)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${localeBtnTab === code ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Titre ({localeBtnTab.toUpperCase()})</label>
                    <input type="text"
                      value={parseJson(editingSlide.titleJson)[localeBtnTab] || ''}
                      onChange={e => setEditingSlide((s: any) => ({ ...s, titleJson: setJsonKey(s.titleJson, localeBtnTab, e.target.value) }))}
                      className="admin-input" placeholder="Ex: Goûtez la Différence..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Sous-titre ({localeBtnTab.toUpperCase()})</label>
                    <input type="text"
                      value={parseJson(editingSlide.subtitleJson)[localeBtnTab] || ''}
                      onChange={e => setEditingSlide((s: any) => ({ ...s, subtitleJson: setJsonKey(s.subtitleJson, localeBtnTab, e.target.value) }))}
                      className="admin-input" placeholder="Description courte..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Texte latéral ({localeBtnTab.toUpperCase()})</label>
                    <input type="text"
                      value={parseJson(editingSlide.sideTextJson)[localeBtnTab] || ''}
                      onChange={e => setEditingSlide((s: any) => ({ ...s, sideTextJson: setJsonKey(s.sideTextJson, localeBtnTab, e.target.value) }))}
                      className="admin-input" placeholder="Texte affiché sur le côté droit..." />
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-400">✅ Badges</label>
                  <button onClick={addBadge} className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors">
                    + Ajouter
                  </button>
                </div>
                {(() => {
                  let badges: any[] = [];
                  try { badges = JSON.parse(editingSlide.badgesJson || '[]'); } catch { /* noop */ }
                  return badges.map((badge: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <div className="flex gap-1 flex-1">
                        {ALL_LOCALES.map(({ code }) => (
                          <input key={code} type="text" value={badge[code] || ''} placeholder={code.toUpperCase()}
                            onChange={e => updateBadge(idx, code, e.target.value)}
                            className="admin-input text-xs py-1 flex-1 min-w-0" />
                        ))}
                      </div>
                      <button onClick={() => removeBadge(idx)} className="text-red-400 hover:text-red-300 p-1">
                        <TrashIcon />
                      </button>
                    </div>
                  ));
                })()}
              </div>

              {/* Background */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">🎨 Arrière-plan</label>
                <div className="flex gap-2 mb-3">
                  {([['color', '🎨 Couleur'], ['gradient', '🌈 Dégradé'], ['image', '🖼️ Image']] as const).map(([t, lbl]) => (
                    <button key={t} type="button" onClick={() => setEditingSlide((s: any) => ({ ...s, bgType: t }))}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors ${editingSlide.bgType === t ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-400 hover:text-white'}`}>
                      {lbl}
                    </button>
                  ))}
                </div>
                {editingSlide.bgType === 'color' && (
                  <ColorPicker label="Couleur" value={editingSlide.bgColor}
                    onChange={c => setEditingSlide((s: any) => ({ ...s, bgColor: c }))} />
                )}
                {editingSlide.bgType === 'gradient' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {GRADIENT_PRESETS.map(p => (
                        <button key={p.label} type="button"
                          onClick={() => setEditingSlide((s: any) => ({ ...s, bgGradient: p.value }))}
                          className="relative h-10 rounded-xl"
                          style={{ background: p.value }}>
                          <span className="text-white text-xs font-semibold drop-shadow">{p.label}</span>
                        </button>
                      ))}
                    </div>
                    <input type="text" value={editingSlide.bgGradient || ''}
                      onChange={e => setEditingSlide((s: any) => ({ ...s, bgGradient: e.target.value }))}
                      className="admin-input font-mono text-xs" placeholder="linear-gradient(135deg, #1F2937, #111827)" />
                  </div>
                )}
              </div>

              {/* Image */}
              <ImageUploader label="🖼️ Image du slide (desktop)" value={editingSlide.imageUrl} folder="hero"
                onChange={url => setEditingSlide((s: any) => ({ ...s, imageUrl: url, bgType: 'image' }))}
                onRemove={() => setEditingSlide((s: any) => ({ ...s, imageUrl: '', bgType: 'color' }))} />

              {/* Mode photo-only */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-3 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={!!editingSlide.photoOnly}
                    onChange={e => setEditingSlide((s: any) => ({ ...s, photoOnly: e.target.checked }))}
                    className="accent-amber-500 w-4 h-4" />
                  <div>
                    <p className="text-sm font-semibold text-white">📷 Mode image seule</p>
                    <p className="text-xs text-gray-400 mt-0.5">Affiche uniquement la photo, sans texte ni overlay sombre</p>
                  </div>
                </label>
                {editingSlide.photoOnly && (
                  <div className="pt-1 border-t border-gray-700">
                    <ImageUploader label="📱 Image mobile (optionnelle)" value={editingSlide.mobileImageUrl || ''} folder="hero"
                      onChange={url => setEditingSlide((s: any) => ({ ...s, mobileImageUrl: url }))}
                      onRemove={() => setEditingSlide((s: any) => ({ ...s, mobileImageUrl: '' }))} />
                    <p className="text-xs text-gray-500 mt-1.5">Si non renseignée, l&apos;image desktop s&apos;affiche aussi sur mobile</p>
                  </div>
                )}
              </div>

              {/* Vidéo — muet, boucle, sans son */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  🎬 Vidéo de fond <span className="text-gray-600 font-normal">(MP4 / WebM · max 20 Mo · muet, boucle)</span>
                </label>
                {editingSlide.videoUrl ? (
                  <div className="relative rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
                    <video
                      src={editingSlide.videoUrl}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="w-full h-32 object-cover opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40">
                      <button type="button"
                        onClick={() => (document.getElementById('video-upload-input') as HTMLInputElement)?.click()}
                        className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur transition-colors">
                        Changer
                      </button>
                      <button type="button"
                        onClick={() => setEditingSlide((s: any) => ({ ...s, videoUrl: '' }))}
                        className="bg-red-500/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                        Supprimer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="relative h-24 rounded-xl border-2 border-dashed border-gray-600 hover:border-amber-500 transition-colors cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-amber-400"
                    onClick={() => (document.getElementById('video-upload-input') as HTMLInputElement)?.click()}
                    onDrop={async e => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (!file) return;
                      const fd = new FormData();
                      fd.append('file', file);
                      fd.append('folder', 'hero');
                      const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' });
                      const data = await res.json();
                      if (data.url) setEditingSlide((s: any) => ({ ...s, videoUrl: data.url }));
                    }}
                    onDragOver={e => e.preventDefault()}
                  >
                    <span className="text-2xl mb-1">🎬</span>
                    <p className="text-xs font-semibold">Glisser-déposer ou cliquer</p>
                    <p className="text-xs opacity-60 mt-0.5">MP4, WebM · max 20 Mo</p>
                  </div>
                )}
                <input
                  id="video-upload-input"
                  type="file"
                  accept="video/mp4,video/webm"
                  className="hidden"
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append('file', file);
                    fd.append('folder', 'hero');
                    const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' });
                    const data = await res.json();
                    if (data.url) setEditingSlide((s: any) => ({ ...s, videoUrl: data.url }));
                    e.target.value = '';
                  }}
                />
                <input type="text" value={editingSlide.videoUrl || ''} placeholder="Ou coller une URL vidéo..."
                  onChange={e => setEditingSlide((s: any) => ({ ...s, videoUrl: e.target.value }))}
                  className="admin-input text-xs mt-2" />
              </div>

              {/* Visibility */}
              <label className="flex items-center gap-3 cursor-pointer bg-gray-800 rounded-xl px-3 py-2">
                <input type="checkbox" checked={!!editingSlide.isVisible}
                  onChange={e => setEditingSlide((s: any) => ({ ...s, isVisible: e.target.checked }))}
                  className="accent-amber-500 w-4 h-4" />
                <span className="text-sm text-white">👁️ Visible</span>
              </label>

              {/* Buttons section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-400">🔘 Boutons CTA</label>
                  <button onClick={addSlideBtn}
                    className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors">
                    + Ajouter
                  </button>
                </div>
                <div className="space-y-2">
                  {(editingSlide.buttons || []).map((btn: any, idx: number) => (
                    <div key={idx} className="bg-gray-800 rounded-xl border border-gray-700">
                      <div className="flex items-center gap-2 p-3">
                        <div className="w-6 h-6 rounded-lg flex-shrink-0"
                          style={{ background: btn.bgGradient || btn.bgColor }} />
                        <span className="flex-1 text-sm text-white truncate">
                          {parseJson(btn.labelJson).fr || parseJson(btn.labelJson).en || `Bouton ${idx + 1}`}
                        </span>
                        <button onClick={() => setEditingBtnIdx(editingBtnIdx === idx ? null : idx)}
                          className="text-xs text-amber-400 hover:text-amber-300 px-2 py-1 rounded bg-amber-500/10">
                          {editingBtnIdx === idx ? 'Fermer' : 'Éditer'}
                        </button>
                        <button onClick={() => removeBtn(idx)} className="text-red-400 p-1">
                          <TrashIcon />
                        </button>
                      </div>
                      {editingBtnIdx === idx && (
                        <div className="px-3 pb-3 space-y-3 border-t border-gray-700 pt-3">
                          <div className="space-y-2">
                            {ALL_LOCALES.map(({ code, label }) => (
                              <div key={code} className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-10 flex-shrink-0">{label}</span>
                                <input type="text" value={parseJson(btn.labelJson)[code] || ''}
                                  onChange={e => updateBtn(idx, 'labelJson', setJsonKey(btn.labelJson, code, e.target.value))}
                                  className="admin-input text-sm py-1.5" placeholder={`Label ${code.toUpperCase()}`} />
                              </div>
                            ))}
                          </div>
                          <input type="text" value={btn.url || ''} placeholder="URL..."
                            onChange={e => updateBtn(idx, 'url', e.target.value)}
                            className="admin-input text-sm" />
                          <div className="flex gap-2">
                            {(['filled', 'outline', 'ghost'] as const).map(st => (
                              <button key={st} type="button" onClick={() => updateBtn(idx, 'style', st)}
                                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-colors ${btn.style === st ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-400 hover:text-white'}`}>
                                {st === 'filled' ? 'Plein' : st === 'outline' ? 'Contour' : 'Ghost'}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <ColorPicker label="Fond" value={btn.bgColor}
                                onChange={c => updateBtn(idx, 'bgColor', c)} />
                            </div>
                            <div className="flex-1">
                              <ColorPicker label="Texte" value={btn.textColor}
                                onChange={c => updateBtn(idx, 'textColor', c)} />
                            </div>
                          </div>
                          {/* Icon picker */}
                          <div>
                            <label className="block text-xs text-gray-500 mb-2">Icône</label>
                            <div className="grid grid-cols-6 gap-1 p-2 bg-gray-700 rounded-xl max-h-36 overflow-y-auto">
                              <button type="button" title="Aucune"
                                onClick={() => updateBtn(idx, 'icon', '')}
                                className={`flex flex-col items-center p-1.5 rounded-lg text-xs ${!btn.icon ? 'bg-amber-500/30 text-amber-300' : 'text-gray-400 hover:bg-gray-600'}`}>
                                <span className="text-sm">∅</span>
                              </button>
                              {ICON_OPTIONS.map(({ key, Icon, label: lbl }) => (
                                <button key={key} type="button" title={lbl}
                                  onClick={() => updateBtn(idx, 'icon', key)}
                                  className={`flex flex-col items-center p-1.5 rounded-lg ${btn.icon === key ? 'bg-amber-500/30 text-amber-300' : 'text-gray-400 hover:bg-gray-600'}`}>
                                  <Icon className="w-3.5 h-3.5" />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-5 pt-0 sticky bottom-0 bg-gray-900 border-t border-gray-700">
              <button onClick={() => setEditingSlide(null)} className="flex-1 admin-btn-ghost">Annuler</button>
              <button onClick={saveSlide} disabled={saving} className="flex-1 admin-btn-primary disabled:opacity-50">
                {saving ? '...' : isNewSlide ? 'Créer' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CARD MODAL ── */}
      {editingCard && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="font-bold text-white">{isNewCard ? '+ Nouvelle carte' : '✏️ Modifier la carte'}</h2>
              <button onClick={() => setEditingCard(null)}><CloseIcon /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Locale tabs */}
              <div className="flex gap-1 mb-1">
                {ALL_LOCALES.map(({ code, label }) => (
                  <button key={code} onClick={() => setLocaleCardTab(code)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${localeCardTab === code ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                    {label}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Titre ({localeCardTab.toUpperCase()})</label>
                <input type="text"
                  value={parseJson(editingCard.titleJson)[localeCardTab] || ''}
                  onChange={e => setEditingCard((c: any) => ({ ...c, titleJson: setJsonKey(c.titleJson, localeCardTab, e.target.value) }))}
                  className="admin-input" placeholder="Ex: Livraison rapide" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">URL (optionnel)</label>
                <input type="text" value={editingCard.url || ''} placeholder="https://..."
                  onChange={e => setEditingCard((c: any) => ({ ...c, url: e.target.value }))}
                  className="admin-input" />
              </div>
              {/* Icon picker */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Icône</label>
                <div className="grid grid-cols-6 gap-1.5 p-3 bg-gray-800 rounded-xl max-h-44 overflow-y-auto">
                  {ICON_OPTIONS.map(({ key, Icon, label: lbl }) => (
                    <button key={key} type="button" title={lbl}
                      onClick={() => setEditingCard((c: any) => ({ ...c, icon: key }))}
                      className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all ${editingCard.icon === key ? 'bg-amber-500/30 ring-2 ring-amber-400 text-amber-300' : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'}`}>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-[9px] truncate w-full text-center">{lbl}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Colors */}
              <div className="grid grid-cols-2 gap-3">
                <ColorPicker label="Fond" value={editingCard.bgColor}
                  onChange={c => setEditingCard((x: any) => ({ ...x, bgColor: c }))} />
                <ColorPicker label="Texte" value={editingCard.textColor}
                  onChange={c => setEditingCard((x: any) => ({ ...x, textColor: c }))} />
                <ColorPicker label="Icône" value={editingCard.iconColor}
                  onChange={c => setEditingCard((x: any) => ({ ...x, iconColor: c }))} />
                <ColorPicker label="Flèche" value={editingCard.arrowColor}
                  onChange={c => setEditingCard((x: any) => ({ ...x, arrowColor: c }))} />
              </div>
              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Aperçu</label>
                <div className="flex items-end justify-between p-4 rounded-2xl"
                  style={{ backgroundColor: editingCard.bgColor, minHeight: '110px' }}>
                  <p className="font-black text-sm" style={{ color: editingCard.textColor }}>
                    {parseJson(editingCard.titleJson)[localeCardTab] || 'Titre...'}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${editingCard.iconColor}20` }}>
                      {(() => {
                        const Icon = ICON_OPTIONS.find(x => x.key === editingCard.icon)?.Icon;
                        return Icon ? <Icon className="w-5 h-5" style={{ color: editingCard.iconColor }} /> : null;
                      })()}
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: `${editingCard.arrowColor}20` }}>
                      <ArrowRight className="w-4 h-4" style={{ color: editingCard.arrowColor }} />
                    </div>
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer bg-gray-800 rounded-xl px-3 py-2">
                <input type="checkbox" checked={!!editingCard.isVisible}
                  onChange={e => setEditingCard((c: any) => ({ ...c, isVisible: e.target.checked }))}
                  className="accent-amber-500 w-4 h-4" />
                <span className="text-sm text-white">👁️ Visible</span>
              </label>
            </div>
            <div className="flex gap-2 p-5 pt-0">
              <button onClick={() => setEditingCard(null)} className="flex-1 admin-btn-ghost">Annuler</button>
              <button onClick={saveCard} disabled={saving} className="flex-1 admin-btn-primary disabled:opacity-50">
                {saving ? '...' : isNewCard ? 'Créer' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
