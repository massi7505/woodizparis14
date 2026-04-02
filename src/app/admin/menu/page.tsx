'use client';

import { useState, useEffect, useMemo } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';
import {
  ExternalLinkIcon, ImportIcon, ChevronSortUpIcon, ChevronSortDownIcon,
  ChevronDownIcon, PlusIcon, EyeIcon, EditIcon, TrashIcon, CloseIcon, CopyIcon,
} from '@/components/ui/icons';

const LOCALES = ['fr', 'en', 'it', 'es'];
const LOCALE_LABELS: Record<string, string> = { fr: '🇫🇷 FR', en: '🇬🇧 EN', it: '🇮🇹 IT', es: '🇪🇸 ES' };
const ALLERGENS_LIST = ['gluten', 'lactose', 'eggs', 'nuts', 'peanuts', 'soy', 'fish', 'shellfish', 'sesame'];
const BADGES_LIST = ['bestseller', 'nouveau', 'veggie', 'piment', 'halal'];

const DEFAULT_CATEGORY = {
  slug: '', iconEmoji: '', iconUrl: '', bgColor: '', isVisible: true,
  translations: LOCALES.map(l => ({ locale: l, name: '', description: '' })),
};

const DEFAULT_PRODUCT = {
  categoryId: 0, slug: '', imageUrl: '', price: '', comparePrice: '',
  allergens: '[]', badges: '[]', isVisible: true, isOutOfStock: false,
  isFeatured: false, isWeekSpecial: false,
  translations: LOCALES.map(l => ({ locale: l, name: '', description: '' })),
};

function mergeTranslations(existing: any[], defaults = LOCALES) {
  return defaults.map(l => existing?.find((x: any) => x.locale === l) || { locale: l, name: '', description: '' });
}

function formatPrice(price: any): string {
  return price ? `${parseFloat(price.toString()).toFixed(2)} €` : '—';
}

function parseJson(str: string): string[] {
  try { return JSON.parse(str) || []; } catch { return []; }
}

function toggleItem(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

function IconBtn({ title, onClick, children, danger }: { title?: string; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors ${danger ? 'text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10' : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-primary)] hover:bg-amber-500/10'}`}
    >
      {children}
    </button>
  );
}

export default function AdminMenuPage() {
  const [tab, setTab] = useState<'categories' | 'products'>('categories');
  const [categories, setCategories] = useState<any[]>([]);
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [editingProd, setEditingProd] = useState<any | null>(null);
  const [savingCat, setSavingCat] = useState(false);
  const [savingProd, setSavingProd] = useState(false);
  const [openCatId, setOpenCatId] = useState<number | null>(null);
  const [filterCatId, setFilterCatId] = useState<number | 'all'>('all');
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importStep, setImportStep] = useState<'upload' | 'preview'>('upload');
  const [toast, setToast] = useState('');
  const [defaultCategoryId, setDefaultCategoryId] = useState<number | null>(null);

  const isNewCat = !editingCat?.id;
  const isNewProd = !editingProd?.id;

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function load() {
    const [menuRes, settingsRes] = await Promise.all([
      fetch('/api/menu?visible=false'),
      fetch('/api/settings'),
    ]);
    const data = await menuRes.json();
    setCategories(Array.isArray(data) ? data : []);
    const settings = await settingsRes.json();
    setDefaultCategoryId(settings?.defaultCategoryId || null);
  }
  useEffect(() => { load(); }, []);

  async function setDefaultCategory(catId: number) {
    const newId = defaultCategoryId === catId ? null : catId;
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defaultCategoryId: newId }),
    });
    setDefaultCategoryId(newId);
    showToast(newId ? 'Catégorie par défaut définie ✓' : 'Catégorie par défaut retirée');
  }

  const allProducts = useMemo(() =>
    categories.flatMap(c => (c.products || []).map((p: any) => ({ ...p, _category: c }))),
    [categories]
  );
  const filteredProducts = useMemo(() =>
    filterCatId === 'all' ? allProducts : allProducts.filter(p => p.categoryId === filterCatId),
    [allProducts, filterCatId]
  );
  const totalProducts = useMemo(() =>
    categories.reduce((s, c) => s + (c.products?.length || 0), 0),
    [categories]
  );

  function openEditCat(cat: any) {
    setEditingCat({ ...cat, translations: mergeTranslations(cat.translations) });
  }

  function openNewCat() {
    setEditingCat({ ...DEFAULT_CATEGORY });
  }

  function openEditProd(prod: any) {
    setEditingProd({
      ...prod,
      price: prod.price?.toString() || '',
      comparePrice: prod.comparePrice?.toString() || '',
      allergens: prod.allergens || '[]',
      badges: prod.badges || '[]',
      translations: mergeTranslations(prod.translations),
    });
  }

  function openNewProd(categoryId: number) {
    setEditingProd({ ...DEFAULT_PRODUCT, categoryId });
  }

  async function toggleProduct(prod: any, field: string) {
    const newValue = !prod[field];
    setCategories(cs => cs.map(c => ({
      ...c,
      products: (c.products || []).map((p: any) =>
        p.id === prod.id ? { ...p, [field]: newValue } : p
      ),
    })));
    const res = await fetch(`/api/menu/${prod.id}?type=product`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: newValue }),
    });
    if (!res.ok) {
      setCategories(cs => cs.map(c => ({
        ...c,
        products: (c.products || []).map((p: any) =>
          p.id === prod.id ? { ...p, [field]: prod[field] } : p
        ),
      })));
    }
  }

  async function saveCategory() {
    if (!editingCat) return;
    setSavingCat(true);
    try {
      if (isNewCat) {
        const res = await fetch('/api/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'category', ...editingCat }) });
        if (!res.ok) throw new Error();
        showToast('✅ Catégorie créée');
      } else {
        const res = await fetch(`/api/menu/${editingCat.id}?type=category`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingCat) });
        if (!res.ok) throw new Error();
        showToast('✅ Catégorie mise à jour');
      }
      setEditingCat(null);
      load();
    } catch { showToast('❌ Erreur'); }
    setSavingCat(false);
  }

  async function deleteCategory(id: number, name: string) {
    if (!confirm(`Supprimer la catégorie "${name}" et tous ses produits ?`)) return;
    await fetch(`/api/menu/${id}?type=category`, { method: 'DELETE' });
    setCategories(cs => cs.filter(c => c.id !== id));
    showToast('🗑️ Catégorie supprimée');
  }

  async function deleteAllCategories() {
    if (!confirm('Supprimer TOUTES les catégories et leurs produits ? Cette action est irréversible.')) return;
    for (const cat of categories) {
      await fetch(`/api/menu/${cat.id}?type=category`, { method: 'DELETE' });
    }
    setCategories([]);
    showToast('🗑️ Toutes les catégories supprimées');
  }

  function exportProducts() {
    const data = allProducts.map(p => {
      const cat = categories.find(c => c.id === p.categoryId);
      return {
        slug: p.slug,
        categorySlug: cat?.slug ?? '',
        imageUrl: p.imageUrl,
        price: p.price,
        comparePrice: p.comparePrice,
        allergens: p.allergens,
        badges: p.badges,
        isVisible: p.isVisible,
        isOutOfStock: p.isOutOfStock,
        isFeatured: p.isFeatured,
        isWeekSpecial: p.isWeekSpecial,
        sortOrder: p.sortOrder,
        translations: p.translations,
      };
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'produits.json'; a.click();
    URL.revokeObjectURL(url);
  }

  async function moveCat(i: number, dir: -1 | 1) {
    const arr = [...categories];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setCategories(arr);
    await fetch('/api/reorder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'category', items: arr.map((c, idx) => ({ id: c.id, sortOrder: idx })) }) });
  }

  async function saveProduct() {
    if (!editingProd) return;
    setSavingProd(true);
    try {
      if (isNewProd) {
        const res = await fetch('/api/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'product', ...editingProd }) });
        if (!res.ok) throw new Error();
        showToast('✅ Produit créé');
      } else {
        const res = await fetch(`/api/menu/${editingProd.id}?type=product`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingProd) });
        if (!res.ok) throw new Error();
        showToast('✅ Produit mis à jour');
      }
      setEditingProd(null);
      load();
    } catch { showToast('❌ Erreur'); }
    setSavingProd(false);
  }

  async function deleteProduct(id: number, name: string) {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    setCategories(cs => cs.map(c => ({ ...c, products: (c.products || []).filter((p: any) => p.id !== id) })));
    await fetch(`/api/menu/${id}?type=product`, { method: 'DELETE' });
    showToast('🗑️ Produit supprimé');
  }

  async function duplicateProduct(prod: any) {
    const { id: _id, createdAt: _ca, updatedAt: _ua, _category, ...data } = prod;
    const payload = {
      type: 'product',
      ...data,
      slug: `${data.slug}-copie`,
      isVisible: false,
      price: data.price?.toString() || '0',
      comparePrice: data.comparePrice?.toString() || null,
      translations: (data.translations || []).map(({ id: _tid, ...t }: any) => t),
    };
    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) { showToast('❌ Erreur duplication'); return; }
    showToast('📋 Produit dupliqué (masqué)');
    load();
  }

  async function moveProd(catId: number, i: number, dir: -1 | 1) {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    const arr = [...cat.products];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setCategories(cs => cs.map(c => c.id === catId ? { ...c, products: arr } : c));
    await fetch('/api/reorder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'product', items: arr.map((p: any, idx: number) => ({ id: p.id, sortOrder: idx })) }) });
  }

  function parseCSV(text: string): any[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
      const vals = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g) || [];
      const obj: any = {};
      headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim().replace(/^"|"$/g, ''); });
      return obj;
    });
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const items = file.name.endsWith('.csv') ? parseCSV(text) : JSON.parse(text);
        if (!Array.isArray(items) || items.length === 0) { showToast('❌ Fichier vide ou format invalide'); return; }
        setImportPreview(items);
        setImportStep('preview');
      } catch { showToast('❌ Fichier invalide'); }
    };
    reader.readAsText(file);
  }

  function closeImport() {
    setShowImport(false);
    setImportStep('upload');
    setImportPreview([]);
    setImportJson('');
  }

  async function runImport() {
    setImporting(true);
    try {
      const items = importStep === 'preview' ? importPreview : JSON.parse(importJson);
      const res = await fetch('/api/menu/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      showToast(`✅ ${data.created} produit(s) importé(s)`);
      closeImport();
      load();
    } catch (e: any) {
      showToast('❌ ' + (e.message || 'JSON invalide'));
    }
    setImporting(false);
  }

  return (
    <div className="dcm-page">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="dcm-page-header admin-fade-in">
        <div>
          <h1 className="dcm-page-title">Menu & Carte</h1>
          <p className="dcm-page-subtitle">
            {categories.length} catégories · {totalProducts} produits
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/menu" target="_blank" rel="noopener noreferrer" className="admin-btn-ghost text-xs">
            <ExternalLinkIcon />
            Aperçu
          </a>
          <button onClick={() => setShowImport(true)} className="admin-btn-ghost text-xs">
            <ImportIcon />
            Importer
          </button>
          {tab === 'categories' ? (
            <>
              {categories.length > 0 && (
                <button onClick={deleteAllCategories} className="admin-btn-ghost text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10">
                  🗑️ Supprimer tout
                </button>
              )}
              <button onClick={openNewCat} className="admin-btn-primary">+ Catégorie</button>
            </>
          ) : (
            <>
              <button onClick={exportProducts} className="admin-btn-ghost text-xs">
                ⬇️ Exporter
              </button>
              <button onClick={() => openNewProd(filterCatId === 'all' ? (categories[0]?.id || 0) : filterCatId)} className="admin-btn-primary">+ Produit</button>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'var(--admin-surface-2)' }}>
        {([['categories', 'Catégories', categories.length], ['products', 'Produits', totalProducts]] as const).map(([t, label, count]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${tab === t ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]'}`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${tab === t ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-[var(--admin-text-muted)]'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {tab === 'categories' && (
        <div className="space-y-3">
          {categories.length === 0 && (
            <div className="admin-card text-center py-12" style={{ color: 'var(--admin-text-muted)' }}>
              Aucune catégorie. Créez votre première catégorie de menu.
            </div>
          )}
          {categories.map((cat, ci) => {
            const t = cat.translations?.find((tr: any) => tr.locale === 'fr') || cat.translations?.[0];
            const isOpen = openCatId === cat.id;
            return (
              <div key={cat.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--admin-border)' }}>
                <div
                  className="flex items-center gap-3 p-4 transition-colors cursor-pointer"
                  style={{ background: isOpen ? 'var(--admin-surface-2)' : 'var(--admin-surface)' }}
                >
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button onClick={() => moveCat(ci, -1)} style={{ color: 'var(--admin-text-muted)' }} className="p-0.5 hover:text-white">
                      <ChevronSortUpIcon />
                    </button>
                    <button onClick={() => moveCat(ci, 1)} style={{ color: 'var(--admin-text-muted)' }} className="p-0.5 hover:text-white">
                      <ChevronSortDownIcon />
                    </button>
                  </div>
                  <button onClick={() => setOpenCatId(isOpen ? null : cat.id)} className="flex-1 flex items-center gap-3 text-left min-w-0">
                    {cat.iconUrl ? (
                      <img src={cat.iconUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                    ) : cat.iconEmoji ? (
                      <span className="text-xl">{cat.iconEmoji}</span>
                    ) : null}
                    <div className="min-w-0">
                      <p className="font-semibold" style={{ color: 'var(--admin-text)' }}>{t?.name || cat.slug}</p>
                      <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{cat.products?.length || 0} produit(s)</p>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 ml-auto flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      title={defaultCategoryId === cat.id ? 'Retirer comme catégorie par défaut' : 'Définir comme catégorie affichée en premier'}
                      onClick={() => setDefaultCategory(cat.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: defaultCategoryId === cat.id ? '#F59E0B' : 'var(--admin-text-muted)' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={defaultCategoryId === cat.id ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                    <IconBtn title="Ajouter un produit" onClick={() => { openNewProd(cat.id); setOpenCatId(cat.id); }}>
                      <PlusIcon />
                    </IconBtn>
                    <IconBtn onClick={() => openEditCat(cat)}>
                      <EditIcon />
                    </IconBtn>
                    <IconBtn danger onClick={() => deleteCategory(cat.id, t?.name || cat.slug)}>
                      <TrashIcon />
                    </IconBtn>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--admin-border)', background: 'var(--admin-bg)' }}>
                    {(!cat.products || cat.products.length === 0) && (
                      <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                        Aucun produit dans cette catégorie.{' '}
                        <button onClick={() => openNewProd(cat.id)} className="text-amber-400 hover:underline">Ajouter</button>
                      </div>
                    )}
                    {cat.products?.map((prod: any, pi: number) => {
                      const pt = prod.translations?.find((tr: any) => tr.locale === 'fr') || prod.translations?.[0];
                      return (
                        <div key={prod.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--admin-border)' }}>
                          <div className="flex flex-col gap-0.5 flex-shrink-0">
                            <button onClick={() => moveProd(cat.id, pi, -1)} style={{ color: 'var(--admin-border-light)' }} className="p-0.5 hover:text-white">
                              <ChevronSortUpIcon />
                            </button>
                            <button onClick={() => moveProd(cat.id, pi, 1)} style={{ color: 'var(--admin-border-light)' }} className="p-0.5 hover:text-white">
                              <ChevronSortDownIcon />
                            </button>
                          </div>
                          {prod.imageUrl && (
                            <img src={prod.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--admin-text)' }}>{pt?.name || prod.slug}</p>
                            <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{formatPrice(prod.price)}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => toggleProduct(prod, 'isFeatured')}
                              title={prod.isFeatured ? 'Retirer des vedettes' : 'Marquer comme vedette'}
                              className={`p-1.5 rounded-lg transition-colors text-base leading-none ${prod.isFeatured ? 'text-amber-400 bg-amber-500/15' : 'text-[var(--admin-text-muted)] hover:text-amber-400 hover:bg-amber-500/10'}`}
                            >⭐</button>
                            <button
                              onClick={() => toggleProduct(prod, 'isVisible')}
                              title={prod.isVisible ? 'Masquer' : 'Afficher'}
                              className={`p-1.5 rounded-lg transition-colors ${prod.isVisible ? 'text-emerald-400' : 'text-[var(--admin-text-muted)] hover:text-emerald-400 hover:bg-emerald-500/10'}`}
                            >
                              <EyeIcon />
                            </button>
                            <IconBtn title="Dupliquer" onClick={() => duplicateProduct(prod)}>
                              <CopyIcon />
                            </IconBtn>
                            <IconBtn onClick={() => openEditProd(prod)}>
                              <EditIcon />
                            </IconBtn>
                            <IconBtn danger onClick={() => deleteProduct(prod.id, pt?.name || prod.slug)}>
                              <TrashIcon />
                            </IconBtn>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'products' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <select
                value={filterCatId}
                onChange={e => setFilterCatId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="admin-input"
              >
                <option value="all">Toutes les catégories ({totalProducts})</option>
                {categories.map(c => {
                  const t = c.translations?.find((tr: any) => tr.locale === 'fr') || c.translations?.[0];
                  return <option key={c.id} value={c.id}>{t?.name || c.slug} ({c.products?.length || 0})</option>;
                })}
              </select>
            </div>
            <span className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
              {filteredProducts.length} produit(s)
            </span>
          </div>

          <div className="space-y-2">
            {filteredProducts.length === 0 && (
              <div className="admin-card text-center py-12" style={{ color: 'var(--admin-text-muted)' }}>
                Aucun produit dans cette catégorie.
              </div>
            )}
            {filteredProducts.map((prod) => {
              const pt = prod.translations?.find((tr: any) => tr.locale === 'fr') || prod.translations?.[0];
              const catT = prod._category?.translations?.find((tr: any) => tr.locale === 'fr') || prod._category?.translations?.[0];
              return (
                <div
                  key={prod.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}
                >
                  {prod.imageUrl ? (
                    <img src={prod.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-xl" style={{ background: 'var(--admin-surface-2)' }}>
                      {prod._category?.iconEmoji || '🍽️'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--admin-text)' }}>{pt?.name || prod.slug}</p>
                      {prod.isFeatured && <span className="admin-badge-amber text-xs">⭐ Vedette</span>}
                      {prod.isWeekSpecial && <span className="admin-badge-red text-xs">🔥 Semaine</span>}
                      {prod.isOutOfStock && <span className="admin-badge-gray text-xs">Rupture</span>}
                      {!prod.isVisible && <span className="admin-badge-gray text-xs">Masqué</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold" style={{ color: 'var(--admin-primary)' }}>{formatPrice(prod.price)}</span>
                      <span className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>·</span>
                      <span className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{catT?.name || prod._category?.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleProduct(prod, 'isFeatured')}
                      title={prod.isFeatured ? 'Retirer des vedettes' : 'Marquer comme vedette'}
                      className={`p-2 rounded-lg text-base leading-none transition-all ${prod.isFeatured ? 'bg-amber-500/20 text-amber-400' : 'text-[var(--admin-text-muted)] hover:bg-amber-500/10 hover:text-amber-400'}`}
                    >⭐</button>
                    <button
                      onClick={() => toggleProduct(prod, 'isWeekSpecial')}
                      title={prod.isWeekSpecial ? 'Retirer spécial semaine' : 'Spécial semaine'}
                      className={`p-2 rounded-lg text-base leading-none transition-all ${prod.isWeekSpecial ? 'bg-red-500/20 text-red-400' : 'text-[var(--admin-text-muted)] hover:bg-red-500/10 hover:text-red-400'}`}
                    >🔥</button>
                    <button
                      onClick={() => toggleProduct(prod, 'isVisible')}
                      title={prod.isVisible ? 'Masquer' : 'Afficher'}
                      className={`p-1.5 rounded-lg transition-colors ${prod.isVisible ? 'text-emerald-400' : 'text-[var(--admin-text-muted)]'} hover:bg-white/5`}
                    >
                      <EyeIcon />
                    </button>
                    <button
                      onClick={() => toggleProduct(prod, 'isOutOfStock')}
                      title={prod.isOutOfStock ? 'Remettre en stock' : 'Marquer rupture'}
                      className={`p-1.5 rounded-lg transition-colors text-xs font-bold ${prod.isOutOfStock ? 'bg-gray-500/20 text-gray-400' : 'text-[var(--admin-text-muted)] hover:bg-white/5'}`}
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                    <IconBtn title="Dupliquer" onClick={() => duplicateProduct(prod)}>
                      <CopyIcon />
                    </IconBtn>
                    <IconBtn onClick={() => openEditProd(prod)}>
                      <EditIcon />
                    </IconBtn>
                    <IconBtn danger onClick={() => deleteProduct(prod.id, pt?.name || prod.slug)}>
                      <TrashIcon />
                    </IconBtn>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl w-full flex flex-col" style={{
            background: 'var(--admin-surface)',
            border: '1px solid var(--admin-border-light)',
            maxWidth: importStep === 'preview' ? '960px' : '560px',
            maxHeight: '90vh',
          }}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 flex-shrink-0" style={{ borderBottom: '1px solid var(--admin-border)' }}>
              <div>
                <h2 className="font-bold" style={{ color: 'var(--admin-text)' }}>
                  {importStep === 'upload' ? 'Importer des produits' : `Prévisualiser · ${importPreview.length} produit(s)`}
                </h2>
                {importStep === 'preview' && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>Modifiez, ajoutez ou supprimez des lignes avant d'enregistrer</p>
                )}
              </div>
              <button onClick={closeImport} style={{ color: 'var(--admin-text-muted)' }} className="hover:text-white"><CloseIcon /></button>
            </div>

            {/* Step 1 — Upload */}
            {importStep === 'upload' && (
              <>
                <div className="p-5 space-y-4 overflow-y-auto">
                  <label
                    className="flex flex-col items-center justify-center gap-3 rounded-xl p-8 cursor-pointer transition-colors border-2 border-dashed"
                    style={{ borderColor: 'var(--admin-border-light)', background: 'var(--admin-surface-2)' }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload({ target: { files: [f] } } as any); }}
                  >
                    <input type="file" accept=".json,.csv" className="hidden" onChange={handleFileUpload} />
                    <div className="text-4xl">📂</div>
                    <div className="text-center">
                      <p className="font-medium" style={{ color: 'var(--admin-text)' }}>Glissez un fichier ou cliquez pour choisir</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--admin-text-muted)' }}>Formats acceptés : JSON · CSV</p>
                    </div>
                  </label>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px" style={{ background: 'var(--admin-border)' }} />
                    <span className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>ou coller du JSON</span>
                    <div className="flex-1 h-px" style={{ background: 'var(--admin-border)' }} />
                  </div>

                  <textarea
                    value={importJson}
                    onChange={e => setImportJson(e.target.value)}
                    className="admin-input resize-none h-28 font-mono text-xs"
                    placeholder='[{"slug":"pizza-reine","categorySlug":"pizzas","price":"13.5","fr_name":"Pizza Reine"}]'
                  />
                  {importJson.trim() && (() => {
                    try {
                      const items = JSON.parse(importJson);
                      return <p className="text-sm text-emerald-400">{Array.isArray(items) ? `${items.length} produit(s) détecté(s)` : 'Format invalide'}</p>;
                    } catch { return <p className="text-sm text-red-400">JSON invalide</p>; }
                  })()}
                </div>
                <div className="flex gap-2 p-5 pt-0 flex-shrink-0">
                  <button onClick={closeImport} className="flex-1 admin-btn-ghost">Annuler</button>
                  <button
                    disabled={!importJson.trim()}
                    className="flex-1 admin-btn-primary disabled:opacity-50"
                    onClick={() => {
                      try {
                        const items = JSON.parse(importJson);
                        if (!Array.isArray(items) || items.length === 0) { showToast('❌ JSON vide ou invalide'); return; }
                        setImportPreview(items);
                        setImportStep('preview');
                      } catch { showToast('❌ JSON invalide'); }
                    }}
                  >
                    Prévisualiser →
                  </button>
                </div>
              </>
            )}

            {/* Step 2 — Preview & Edit */}
            {importStep === 'preview' && (
              <>
                <div className="overflow-auto flex-1 p-4">
                  <table className="w-full text-xs" style={{ borderCollapse: 'separate', borderSpacing: '0 3px' }}>
                    <thead>
                      <tr>
                        {['#', 'Nom FR', 'Slug', 'Catégorie', 'Prix €', 'Description FR', ''].map(h => (
                          <th key={h} className="text-left pb-2 px-2 font-medium whitespace-nowrap" style={{ color: 'var(--admin-text-muted)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((item, i) => (
                        <tr key={i}>
                          <td className="px-2 py-0.5 rounded-l-lg text-center w-6" style={{ background: 'var(--admin-surface-2)', color: 'var(--admin-text-muted)' }}>{i + 1}</td>
                          <td className="px-1 py-0.5" style={{ background: 'var(--admin-surface-2)' }}>
                            <input className="admin-input text-xs py-1 px-2 h-7 min-w-[120px]" value={item.fr_name || ''}
                              onChange={e => setImportPreview(p => p.map((r, ri) => ri === i ? { ...r, fr_name: e.target.value } : r))} />
                          </td>
                          <td className="px-1 py-0.5" style={{ background: 'var(--admin-surface-2)' }}>
                            <input className="admin-input text-xs py-1 px-2 h-7 font-mono min-w-[110px]" value={item.slug || ''}
                              onChange={e => setImportPreview(p => p.map((r, ri) => ri === i ? { ...r, slug: e.target.value } : r))} />
                          </td>
                          <td className="px-1 py-0.5" style={{ background: 'var(--admin-surface-2)' }}>
                            <input className="admin-input text-xs py-1 px-2 h-7 min-w-[100px]" value={item.categorySlug || ''}
                              onChange={e => setImportPreview(p => p.map((r, ri) => ri === i ? { ...r, categorySlug: e.target.value } : r))} />
                          </td>
                          <td className="px-1 py-0.5" style={{ background: 'var(--admin-surface-2)' }}>
                            <input type="number" step="0.5" className="admin-input text-xs py-1 px-2 h-7 w-20" value={item.price || ''}
                              onChange={e => setImportPreview(p => p.map((r, ri) => ri === i ? { ...r, price: e.target.value } : r))} />
                          </td>
                          <td className="px-1 py-0.5" style={{ background: 'var(--admin-surface-2)' }}>
                            <input className="admin-input text-xs py-1 px-2 h-7 min-w-[150px]" value={item.fr_description || ''}
                              onChange={e => setImportPreview(p => p.map((r, ri) => ri === i ? { ...r, fr_description: e.target.value } : r))} />
                          </td>
                          <td className="px-2 py-0.5 rounded-r-lg" style={{ background: 'var(--admin-surface-2)' }}>
                            <button onClick={() => setImportPreview(p => p.filter((_, ri) => ri !== i))}
                              className="text-[var(--admin-text-muted)] hover:text-red-400 transition-colors" title="Supprimer">
                              <CloseIcon />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-2 p-4 flex-shrink-0" style={{ borderTop: '1px solid var(--admin-border)' }}>
                  <button onClick={() => { setImportStep('upload'); setImportPreview([]); }} className="admin-btn-ghost text-sm">← Retour</button>
                  <button
                    onClick={() => setImportPreview(p => [...p, { slug: '', categorySlug: '', price: '', fr_name: '', fr_description: '' }])}
                    className="admin-btn-ghost text-sm"
                  >+ Ligne</button>
                  <button onClick={runImport} disabled={importing || importPreview.length === 0} className="flex-1 admin-btn-primary disabled:opacity-50 text-sm">
                    {importing ? 'Enregistrement...' : `Enregistrer ${importPreview.length} produit(s)`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {editingCat && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border-light)' }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--admin-border)' }}>
              <h2 className="font-bold" style={{ color: 'var(--admin-text)' }}>{isNewCat ? 'Nouvelle catégorie' : 'Modifier la catégorie'}</h2>
              <button onClick={() => setEditingCat(null)} style={{ color: 'var(--admin-text-muted)' }} className="hover:text-white">
                <CloseIcon />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>Slug *</label>
                  <input type="text" value={editingCat.slug || ''} onChange={e => setEditingCat((x: any) => ({ ...x, slug: e.target.value }))} className="admin-input" placeholder="pizzas-classiques" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>Emoji (si pas d'image)</label>
                  <input type="text" value={editingCat.iconEmoji || ''} onChange={e => setEditingCat((x: any) => ({ ...x, iconEmoji: e.target.value }))} className="admin-input" placeholder="🍕" />
                </div>
              </div>
              <div>
                <ImageUploader
                  label="Image de l'icône (remplace l'emoji)"
                  value={editingCat.iconUrl || ''}
                  onChange={url => setEditingCat((x: any) => ({ ...x, iconUrl: url }))}
                  onRemove={() => setEditingCat((x: any) => ({ ...x, iconUrl: '' }))}
                  folder="categories"
                  aspectRatio="aspect-square"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer rounded-xl px-3 py-2" style={{ background: 'var(--admin-surface-2)' }}>
                <input type="checkbox" checked={!!editingCat.isVisible} onChange={e => setEditingCat((x: any) => ({ ...x, isVisible: e.target.checked }))} className="accent-amber-500 w-4 h-4" />
                <span className="text-sm" style={{ color: 'var(--admin-text)' }}>Visible</span>
              </label>
              <div style={{ borderTop: '1px solid var(--admin-border)' }} className="pt-4">
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--admin-text)' }}>Traductions</p>
                {LOCALES.map(locale => {
                  const t = editingCat.translations?.find((x: any) => x.locale === locale) || { locale, name: '', description: '' };
                  const update = (field: string, val: string) => setEditingCat((e: any) => ({ ...e, translations: (e.translations || []).map((x: any) => x.locale === locale ? { ...x, [field]: val } : x) }));
                  return (
                    <div key={locale} className="mb-3">
                      <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>{LOCALE_LABELS[locale]}</label>
                      <input type="text" value={t.name || ''} onChange={ev => update('name', ev.target.value)} className="admin-input mb-1.5" placeholder="Nom de la catégorie *" />
                      <input type="text" value={t.description || ''} onChange={ev => update('description', ev.target.value)} className="admin-input text-sm" placeholder="Description (optionnel)" />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 p-5 pt-0">
              <button onClick={() => setEditingCat(null)} className="flex-1 admin-btn-ghost">Annuler</button>
              <button onClick={saveCategory} disabled={savingCat} className="flex-1 admin-btn-primary disabled:opacity-50">{savingCat ? '...' : isNewCat ? 'Créer' : 'Sauvegarder'}</button>
            </div>
          </div>
        </div>
      )}

      {editingProd && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border-light)' }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--admin-border)' }}>
              <h2 className="font-bold" style={{ color: 'var(--admin-text)' }}>{isNewProd ? 'Nouveau produit' : 'Modifier le produit'}</h2>
              <button onClick={() => setEditingProd(null)} style={{ color: 'var(--admin-text-muted)' }} className="hover:text-white">
                <CloseIcon />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <ImageUploader label="Image du produit" value={editingProd.imageUrl} folder="menu"
                onChange={url => setEditingProd((x: any) => ({ ...x, imageUrl: url }))}
                onRemove={() => setEditingProd((x: any) => ({ ...x, imageUrl: '' }))} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>Slug *</label>
                  <input type="text" value={editingProd.slug || ''} onChange={e => setEditingProd((x: any) => ({ ...x, slug: e.target.value }))} className="admin-input" placeholder="pizza-margherita" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>Catégorie</label>
                  <select value={editingProd.categoryId || ''} onChange={e => setEditingProd((x: any) => ({ ...x, categoryId: parseInt(e.target.value) }))} className="admin-input">
                    <option value="">— Choisir —</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.translations?.find((tr: any) => tr.locale === 'fr')?.name || c.translations?.[0]?.name || c.slug}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>Prix (€) *</label>
                  <input type="number" step="0.01" min="0" value={editingProd.price || ''} onChange={e => setEditingProd((x: any) => ({ ...x, price: e.target.value }))} className="admin-input" placeholder="12.50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>Prix barré (€)</label>
                  <input type="number" step="0.01" min="0" value={editingProd.comparePrice || ''} onChange={e => setEditingProd((x: any) => ({ ...x, comparePrice: e.target.value }))} className="admin-input" placeholder="15.00" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[{ key: 'isVisible', label: 'Visible' }, { key: 'isOutOfStock', label: 'Rupture' }, { key: 'isFeatured', label: '⭐ Vedette' }, { key: 'isWeekSpecial', label: '🔥 Semaine' }].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer rounded-xl px-3 py-2" style={{ background: 'var(--admin-surface-2)' }}>
                    <input type="checkbox" checked={!!editingProd[key]} onChange={e => setEditingProd((x: any) => ({ ...x, [key]: e.target.checked }))} className="accent-amber-500 w-4 h-4" />
                    <span className="text-xs" style={{ color: 'var(--admin-text)' }}>{label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text-muted)' }}>Badges</label>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const activeBadges = parseJson(editingProd.badges);
                    return BADGES_LIST.map(b => {
                      const active = activeBadges.includes(b);
                      return (
                        <button key={b} type="button"
                          onClick={() => setEditingProd((x: any) => ({ ...x, badges: JSON.stringify(toggleItem(parseJson(x.badges), b)) }))}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${active ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' : 'border border-transparent text-[var(--admin-text-muted)]'}`}
                          style={active ? {} : { background: 'var(--admin-surface-2)' }}>
                          {b}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text-muted)' }}>Allergènes</label>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const activeAllergens = parseJson(editingProd.allergens);
                    return ALLERGENS_LIST.map(a => {
                      const active = activeAllergens.includes(a);
                      return (
                        <button key={a} type="button"
                          onClick={() => setEditingProd((x: any) => ({ ...x, allergens: JSON.stringify(toggleItem(parseJson(x.allergens), a)) }))}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${active ? 'bg-red-500/25 text-red-300 border border-red-500/40' : 'border border-transparent text-[var(--admin-text-muted)]'}`}
                          style={active ? {} : { background: 'var(--admin-surface-2)' }}>
                          {a}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--admin-border)' }} className="pt-4">
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--admin-text)' }}>Traductions</p>
                {LOCALES.map(locale => {
                  const t = editingProd.translations?.find((x: any) => x.locale === locale) || { locale, name: '', description: '' };
                  const update = (field: string, val: string) => setEditingProd((e: any) => ({ ...e, translations: (e.translations || []).map((x: any) => x.locale === locale ? { ...x, [field]: val } : x) }));
                  return (
                    <div key={locale} className="mb-3">
                      <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>{LOCALE_LABELS[locale]}</label>
                      <input type="text" value={t.name || ''} onChange={ev => update('name', ev.target.value)} className="admin-input mb-1.5" placeholder="Nom du produit *" />
                      <textarea value={t.description || ''} onChange={ev => update('description', ev.target.value)} className="admin-input resize-none h-16 text-sm" placeholder="Description (optionnel)" />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 p-5 pt-0">
              <button onClick={() => setEditingProd(null)} className="flex-1 admin-btn-ghost">Annuler</button>
              <button onClick={saveProduct} disabled={savingProd} className="flex-1 admin-btn-primary disabled:opacity-50">{savingProd ? '...' : isNewProd ? 'Créer' : 'Sauvegarder'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
