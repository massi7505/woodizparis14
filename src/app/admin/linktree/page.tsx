'use client';

import { useState, useEffect } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';
import ColorPicker from '@/components/admin/ColorPicker';
import { ChevronSortUpIcon, ChevronSortDownIcon, EditIcon, TrashIcon, CloseIcon } from '@/components/ui/icons';
import {
  ShoppingCart, ShoppingBag, UtensilsCrossed, MapPin, Phone, Star, Clock, Globe,
  Instagram, Youtube, Facebook, Twitter, Music2, ExternalLink,
  Heart, Gift, Ticket, Award, Truck, Coffee, Pizza, Salad, ChefHat,
  Bike, Car, Navigation, MessageCircle, Send, BookOpen, Camera,
  Percent, Tag, Flame, Leaf, Fish, Beef, Egg, Wheat,
  Sparkles, Share2, Info, Zap, Home,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* Google "G" SVG multicolore — Lucide n'a pas d'icône Google */
function GoogleSVGIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

const ICON_OPTIONS: { key: string; Icon: LucideIcon; label: string }[] = [
  { key: 'shopping-cart',  Icon: ShoppingCart,    label: 'Panier' },
  { key: 'shopping-bag',   Icon: ShoppingBag,     label: 'Sac' },
  { key: 'delivery',       Icon: Truck,           label: 'Livraison' },
  { key: 'bike',           Icon: Bike,            label: 'Vélo' },
  { key: 'car',            Icon: Car,             label: 'Voiture' },
  { key: 'food',           Icon: UtensilsCrossed, label: 'Repas' },
  { key: 'menu',           Icon: BookOpen,        label: 'Menu' },
  { key: 'pizza',          Icon: Pizza,           label: 'Pizza' },
  { key: 'coffee',         Icon: Coffee,          label: 'Café' },
  { key: 'salad',          Icon: Salad,           label: 'Salade' },
  { key: 'chef',           Icon: ChefHat,         label: 'Chef' },
  { key: 'fish',           Icon: Fish,            label: 'Poisson' },
  { key: 'beef',           Icon: Beef,            label: 'Viande' },
  { key: 'egg',            Icon: Egg,             label: 'Œuf' },
  { key: 'wheat',          Icon: Wheat,           label: 'Blé' },
  { key: 'leaf',           Icon: Leaf,            label: 'Végé' },
  { key: 'flame',          Icon: Flame,           label: 'Épicé' },
  { key: 'zap',            Icon: Zap,             label: 'Flash' },
  { key: 'map-pin',        Icon: MapPin,          label: 'Lieu' },
  { key: 'navigation',     Icon: Navigation,      label: 'GPS' },
  { key: 'phone',          Icon: Phone,           label: 'Tél' },
  { key: 'message',        Icon: MessageCircle,   label: 'Message' },
  { key: 'telegram',       Icon: Send,            label: 'Telegram' },
  { key: 'instagram',      Icon: Instagram,       label: 'Instagram' },
  { key: 'facebook',       Icon: Facebook,        label: 'Facebook' },
  { key: 'twitter',        Icon: Twitter,         label: 'Twitter' },
  { key: 'youtube',        Icon: Youtube,         label: 'YouTube' },
  { key: 'tiktok',         Icon: Music2,          label: 'TikTok' },
  { key: 'camera',         Icon: Camera,          label: 'Photo' },
  { key: 'globe',          Icon: Globe,           label: 'Web' },
  { key: 'link',           Icon: ExternalLink,    label: 'Lien' },
  { key: 'star',           Icon: Star,            label: 'Étoile' },
  { key: 'heart',          Icon: Heart,           label: 'Cœur' },
  { key: 'gift',           Icon: Gift,            label: 'Cadeau' },
  { key: 'ticket',         Icon: Ticket,          label: 'Ticket' },
  { key: 'percent',        Icon: Percent,         label: 'Promo' },
  { key: 'tag',            Icon: Tag,             label: 'Tag' },
  { key: 'award',          Icon: Award,           label: 'Prix' },
  { key: 'clock',          Icon: Clock,           label: 'Horaires' },
  { key: 'home',           Icon: Home,            label: 'Accueil' },
  { key: 'sparkles',       Icon: Sparkles,        label: 'Éclat' },
  { key: 'share',          Icon: Share2,          label: 'Partage' },
  { key: 'info',           Icon: Info,            label: 'Info' },
  { key: 'google',         Icon: GoogleSVGIcon as unknown as LucideIcon, label: 'Google' },
  { key: 'google-reviews', Icon: GoogleSVGIcon as unknown as LucideIcon, label: 'Google Avis' },
];

const BUTTON_STYLES = ['filled', 'outline', 'ghost'];
const STYLE_LABELS: Record<string, string> = { filled: 'Plein', outline: 'Contour', ghost: 'Transparent' };

const GRADIENT_PRESETS = [
  { label: 'Feu', value: 'linear-gradient(135deg, #F59E0B, #EF4444)' },
  { label: 'Coucher', value: 'linear-gradient(135deg, #F97316, #EC4899)' },
  { label: 'Océan', value: 'linear-gradient(135deg, #06B6D4, #3B82F6)' },
  { label: 'Forêt', value: 'linear-gradient(135deg, #22C55E, #14B8A6)' },
  { label: 'Nuit', value: 'linear-gradient(135deg, #6366F1, #EC4899)' },
  { label: 'Or', value: 'linear-gradient(135deg, #F59E0B, #EAB308)' },
];

const ALL_LOCALES = [
  { code: 'fr', label: '🇫🇷 FR' },
  { code: 'en', label: '🇬🇧 EN' },
  { code: 'it', label: '🇮🇹 IT' },
  { code: 'es', label: '🇪🇸 ES' },
];

const DEFAULT_BUTTON = {
  label: '', url: '', icon: '', iconUrl: '',
  bgColor: '#F59E0B', bgGradient: '', bgType: 'color',
  textColor: '#FFFFFF', borderColor: '',
  style: 'filled', isVisible: true, section: 'main',
  labelTranslations: '{}',
};

const DEFAULT_SETTINGS = {
  coverType: 'image', coverColor: '#111827',
  coverImageUrl: '', coverVideoUrl: '',
  bgColor: '#111827', bgImageUrl: '',
  profileName: 'Woodiz Paris 15', profileSubtitle: '',
  profileImageUrl: '', noticeText: '', noticeIcon: '',
  showHours: true, showFaqs: true, showPromos: true, showNotif: true,
};

export default function AdminLinktreePage() {
  const [buttons, setButtons] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(DEFAULT_SETTINGS);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState<'buttons' | 'settings'>('buttons');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function load() {
    const res = await fetch('/api/linktree?visible=false');
    const data = await res.json();
    setButtons(data.buttons || []);
    if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
  }
  useEffect(() => { load(); }, []);

  async function saveButton() {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) {
        const res = await fetch('/api/linktree', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const b = await res.json();
        setButtons(bs => [...bs, b]);
      } else {
        const res = await fetch(`/api/linktree/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const b = await res.json();
        setButtons(bs => bs.map(x => x.id === b.id ? b : x));
      }
      setEditing(null);
      showToast('✅ Bouton sauvegardé');
    } catch (e) { showToast(`❌ Erreur: ${e instanceof Error ? e.message : 'inconnue'}`); }
    setSaving(false);
  }

  async function deleteButton(id: number, label: string) {
    if (!confirm(`Supprimer le bouton "${label}" ?`)) return;
    await fetch(`/api/linktree/${id}`, { method: 'DELETE' });
    setButtons(bs => bs.filter(b => b.id !== id));
    showToast('🗑️ Bouton supprimé');
  }

  async function saveSettings() {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/linktree', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'settings', ...settings }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast('✅ Paramètres sauvegardés');
    } catch (e) { showToast(`❌ Erreur: ${e instanceof Error ? e.message : 'inconnue'}`); }
    setSavingSettings(false);
  }

  async function move(i: number, dir: -1 | 1) {
    const arr = [...buttons];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    const items = arr.map((b, idx) => ({ id: b.id, sortOrder: idx }));
    await fetch('/api/reorder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'button', items }) });
    load();
  }

  return (
    <div className="dcm-page">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="dcm-page-header admin-fade-in">
        <div>
          <h1 className="dcm-page-title">🔗 Linktree</h1>
          <p className="dcm-page-subtitle">Gérer les boutons et paramètres de la page linktree</p>
        </div>
        <a href="/linktree" target="_blank" rel="noopener noreferrer"
          className="text-xs px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors font-mono">
          👁️ Aperçu
        </a>
      </div>

      {/* Tabs */}
      <div className="dcm-tabs-loose">
        {(['buttons', 'settings'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`dcm-tab-loose${tab === t ? ' active' : ''}`}>
            {t === 'buttons' ? '🔘 Boutons' : '⚙️ Paramètres'}
          </button>
        ))}
      </div>

      {tab === 'buttons' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => { setEditing({ ...DEFAULT_BUTTON }); setIsNew(true); }} className="admin-btn-primary">
              + Ajouter un bouton
            </button>
          </div>
          <div className="space-y-2">
            {buttons.length === 0 && (
              <div className="admin-card text-center text-gray-500 py-12">Aucun bouton. Ajoutez des liens pour votre linktree.</div>
            )}
            {buttons.map((btn, i) => (
              <div key={btn.id} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${btn.isVisible ? 'border-gray-700 bg-gray-800' : 'border-gray-800 bg-gray-900 opacity-60'}`}>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => move(i, -1)} className="text-gray-600 hover:text-gray-300 p-0.5">
                    <ChevronSortUpIcon />
                  </button>
                  <button onClick={() => move(i, 1)} className="text-gray-600 hover:text-gray-300 p-0.5">
                    <ChevronSortDownIcon />
                  </button>
                </div>
                <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: btn.bgGradient || btn.bgColor }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{btn.label || '—'}</p>
                  <p className="text-xs text-gray-500 truncate">{btn.url}</p>
                </div>
                <span className="text-xs text-gray-500 hidden sm:block">{btn.section}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditing({ ...btn }); setIsNew(false); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                    <EditIcon />
                  </button>
                  <button onClick={() => deleteButton(btn.id, btn.label)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'settings' && (
        <div className="space-y-6">
          <div className="admin-card space-y-4">
            <h2 className="font-bold text-white">🖼️ Couverture</h2>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Type de couverture</label>
              <div className="flex gap-2">
                {(['image', 'video', 'color'] as const).map(t => (
                  <button key={t} onClick={() => setSettings((s: any) => ({ ...s, coverType: t }))}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${settings.coverType === t ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-400 hover:text-white'}`}>
                    {t === 'image' ? 'Image' : t === 'video' ? 'Vidéo' : 'Couleur'}
                  </button>
                ))}
              </div>
            </div>
            {settings.coverType === 'image' && (
              <ImageUploader label="Image de couverture" value={settings.coverImageUrl} folder="linktree"
                onChange={url => setSettings((s: any) => ({ ...s, coverImageUrl: url }))}
                onRemove={() => setSettings((s: any) => ({ ...s, coverImageUrl: '' }))} />
            )}
            {settings.coverType === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">URL de la vidéo</label>
                <input type="text" value={settings.coverVideoUrl || ''} onChange={e => setSettings((s: any) => ({ ...s, coverVideoUrl: e.target.value }))} className="admin-input" placeholder="https://..." />
              </div>
            )}
            {settings.coverType === 'color' && (
              <ColorPicker label="Couleur de couverture" value={settings.coverColor} onChange={c => setSettings((s: any) => ({ ...s, coverColor: c }))} />
            )}
          </div>

          <div className="admin-card space-y-4">
            <h2 className="font-bold text-white">🎨 Arrière-plan</h2>
            <ColorPicker label="Couleur de fond" value={settings.bgColor} onChange={c => setSettings((s: any) => ({ ...s, bgColor: c }))} />
            <ImageUploader label="Image de fond (optionnel)" value={settings.bgImageUrl} folder="linktree"
              onChange={url => setSettings((s: any) => ({ ...s, bgImageUrl: url }))}
              onRemove={() => setSettings((s: any) => ({ ...s, bgImageUrl: '' }))} />
          </div>

          <div className="admin-card space-y-4">
            <h2 className="font-bold text-white">👤 Profil</h2>
            <ImageUploader label="Photo de profil" value={settings.profileImageUrl} folder="linktree" aspectRatio="aspect-square"
              onChange={url => setSettings((s: any) => ({ ...s, profileImageUrl: url }))}
              onRemove={() => setSettings((s: any) => ({ ...s, profileImageUrl: '' }))} />
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Nom</label>
              <input type="text" value={settings.profileName || ''} onChange={e => setSettings((s: any) => ({ ...s, profileName: e.target.value }))} className="admin-input" placeholder="Woodiz Paris 15" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Sous-titre</label>
              <input type="text" value={settings.profileSubtitle || ''} onChange={e => setSettings((s: any) => ({ ...s, profileSubtitle: e.target.value }))} className="admin-input" placeholder="Pizzeria artisanale..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Notice / Annonce</label>
              <input type="text" value={settings.noticeText || ''} onChange={e => setSettings((s: any) => ({ ...s, noticeText: e.target.value }))} className="admin-input" placeholder="Fermé le 25 décembre..." />
            </div>
          </div>

          <div className="admin-card space-y-3">
            <h2 className="font-bold text-white">👁️ Sections visibles</h2>
            {[{ key: 'showNotif', label: '🔔 Barre de notification' }, { key: 'showHours', label: '🕐 Horaires' }, { key: 'showPromos', label: '🎯 Promotions' }, { key: 'showFaqs', label: '❓ FAQs' }].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={!!settings[key]} onChange={e => setSettings((s: any) => ({ ...s, [key]: e.target.checked }))} className="accent-amber-500 w-4 h-4" />
                <span className="text-sm text-white">{label}</span>
              </label>
            ))}
          </div>

          <button onClick={saveSettings} disabled={savingSettings} className="admin-btn-primary w-full py-3 disabled:opacity-50">
            {savingSettings ? 'Sauvegarde...' : '💾 Sauvegarder les paramètres'}
          </button>
        </div>
      )}

      {/* Button Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="font-bold text-white">{isNew ? 'Nouveau bouton' : 'Modifier le bouton'}</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white">
                <CloseIcon />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Label *</label>
                <input type="text" value={editing.label || ''} onChange={e => setEditing((x: any) => ({ ...x, label: e.target.value }))} className="admin-input" placeholder="Commander en ligne" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">URL *</label>
                <input type="text" value={editing.url || ''} onChange={e => setEditing((x: any) => ({ ...x, url: e.target.value }))} className="admin-input" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Section / Groupe</label>
                <select value={editing.section || 'main'} onChange={e => setEditing((x: any) => ({ ...x, section: e.target.value }))} className="admin-input">
                  <option value="main">🔗 Principal (main)</option>
                  <option value="commander">🛒 Commander</option>
                  <option value="contact">📞 Nous contacter</option>
                  <option value="emporter">🥡 Menu — À emporter</option>
                  <option value="livraison">🛵 Menu — En livraison</option>
                  <option value="discover">✨ Découvrir</option>
                  <option value="social">📱 Réseaux sociaux</option>
                  <option value="info">ℹ️ Informations</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Style</label>
                <div className="flex gap-2">
                  {BUTTON_STYLES.map(s => (
                    <button key={s} type="button" onClick={() => setEditing((x: any) => ({ ...x, style: s }))}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${editing.style === s ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-400 hover:text-white'}`}>
                      {STYLE_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
              {/* Background type */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Fond du bouton</label>
                <div className="flex gap-2 mb-3">
                  {([['color', '🎨 Couleur'], ['gradient', '🌈 Dégradé']] as const).map(([t, label]) => (
                    <button key={t} type="button" onClick={() => setEditing((x: any) => ({ ...x, bgType: t }))}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors ${(editing.bgType || 'color') === t ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-400 hover:text-white'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                {(!editing.bgType || editing.bgType === 'color') && (
                  <ColorPicker label="Couleur de fond" value={editing.bgColor} onChange={c => setEditing((x: any) => ({ ...x, bgColor: c }))} />
                )}
                {editing.bgType === 'gradient' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Dégradés prédéfinis</label>
                      <div className="grid grid-cols-3 gap-2">
                        {GRADIENT_PRESETS.map(p => (
                          <button key={p.label} type="button"
                            onClick={() => setEditing((x: any) => ({ ...x, bgGradient: p.value }))}
                            className={`relative h-10 rounded-xl transition-all ${editing.bgGradient === p.value ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-900' : 'opacity-80 hover:opacity-100'}`}
                            style={{ background: p.value }}
                            title={p.label}
                          >
                            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold drop-shadow">{p.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">CSS personnalisé</label>
                      <input type="text" value={editing.bgGradient || ''} onChange={e => setEditing((x: any) => ({ ...x, bgGradient: e.target.value }))}
                        className="admin-input font-mono text-xs" placeholder="linear-gradient(135deg, #F59E0B, #EF4444)" />
                      {editing.bgGradient && (
                        <div className="mt-2 h-8 rounded-xl w-full" style={{ background: editing.bgGradient }} />
                      )}
                    </div>
                  </div>
                )}
              </div>
              <ColorPicker label="Couleur texte" value={editing.textColor} onChange={c => setEditing((x: any) => ({ ...x, textColor: c }))} />

              {/* Translations */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">🌍 Traductions du label</label>
                <div className="space-y-2">
                  {ALL_LOCALES.map(({ code, label }) => {
                    let translations: Record<string, string> = {};
                    try { translations = JSON.parse(editing.labelTranslations || '{}'); } catch { /* noop */ }
                    return (
                      <div key={code} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-10 flex-shrink-0">{label}</span>
                        <input
                          type="text"
                          value={translations[code] || ''}
                          onChange={e => {
                            let t: Record<string, string> = {};
                            try { t = JSON.parse(editing.labelTranslations || '{}'); } catch { /* noop */ }
                            t[code] = e.target.value;
                            setEditing((x: any) => ({ ...x, labelTranslations: JSON.stringify(t) }));
                          }}
                          className="admin-input text-sm py-1.5"
                          placeholder={code === 'fr' ? (editing.label || 'Label par défaut') : `Traduction ${code.toUpperCase()}...`}
                        />
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-600 mt-1.5">Si vide, utilise le label par défaut ci-dessus.</p>
              </div>

              {/* Icon picker */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">🎨 Icône</label>
                <div className="grid grid-cols-6 gap-1.5 p-3 bg-gray-800 rounded-xl max-h-52 overflow-y-auto">
                  {/* None option */}
                  <button
                    type="button"
                    title="Aucune icône"
                    onClick={() => setEditing((x: any) => ({ ...x, icon: '' }))}
                    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all text-xs ${!editing.icon ? 'bg-amber-500/30 ring-2 ring-amber-400 text-amber-300' : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'}`}
                  >
                    <span className="text-base leading-none">∅</span>
                    <span className="text-[9px] leading-none text-center truncate w-full">Aucune</span>
                  </button>
                  {ICON_OPTIONS.map(({ key, Icon, label }) => (
                    <button
                      key={key}
                      type="button"
                      title={label}
                      onClick={() => setEditing((x: any) => ({ ...x, icon: key }))}
                      className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all ${editing.icon === key ? 'bg-amber-500/30 ring-2 ring-amber-400 text-amber-300' : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'}`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-[9px] leading-none text-center truncate w-full">{label}</span>
                    </button>
                  ))}
                </div>
                {editing.icon && (
                  <p className="text-xs text-gray-500 mt-1.5">Icône sélectionnée : <span className="text-amber-400 font-mono">{editing.icon}</span></p>
                )}
              </div>

              <ImageUploader label="Image icône personnalisée (optionnel)" value={editing.iconUrl} folder="linktree" aspectRatio="aspect-video"
                onChange={url => setEditing((x: any) => ({ ...x, iconUrl: url }))}
                onRemove={() => setEditing((x: any) => ({ ...x, iconUrl: '' }))} />
              <label className="flex items-center gap-3 cursor-pointer bg-gray-800 rounded-xl px-3 py-2">
                <input type="checkbox" checked={!!editing.isVisible} onChange={e => setEditing((x: any) => ({ ...x, isVisible: e.target.checked }))} className="accent-amber-500 w-4 h-4" />
                <span className="text-sm text-white">👁️ Visible</span>
              </label>
            </div>
            <div className="flex gap-2 p-5 pt-0">
              <button onClick={() => setEditing(null)} className="flex-1 admin-btn-ghost">Annuler</button>
              <button onClick={saveButton} disabled={saving} className="flex-1 admin-btn-primary disabled:opacity-50">{saving ? '...' : isNew ? 'Créer' : 'Sauvegarder'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
