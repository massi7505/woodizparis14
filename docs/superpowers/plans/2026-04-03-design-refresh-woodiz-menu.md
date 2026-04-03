# Design Refresh Menu Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Affiner visuellement la page Menu (minimaliste premium, mobile-first QR code) sans toucher à la logique métier.

**Architecture:** Modifications CSS et JSX sur les composants existants uniquement. Aucun nouveau fichier. Aucun changement de structure de données, d'API ou de logique.

**Tech Stack:** Next.js 15, Tailwind CSS 3.4, React 19, TypeScript

**Contrainte absolue:** `grid-cols-2` sur mobile ne change pas.

---

## File Map

| Fichier | Changements |
|---|---|
| `src/app/globals.css` | `.menu-card` + border + active state ; `.category-pill.inactive` refait |
| `src/components/menu/MenuHeader.tsx` | backdrop-blur, search rounded-full |
| `src/components/menu/MenuClient.tsx` | sticky tabs backdrop-blur, titres de section font-display |
| `src/components/menu/ProductCard.tsx` | description hidden mobile, p-2.5, prix text-sm font-bold |
| `src/components/menu/CategoryTabs.tsx` | images cachées sur mobile |
| `src/components/menu/ReviewsSection.tsx` | titre section font-display |
| `src/components/menu/MenuFooter.tsx` | newsletter input rounded-full |

---

## Task 1 — globals.css : menu-card et category-pill

**Files:**
- Modify: `src/app/globals.css:39-55`

### Changements ciblés

**`.menu-card`** — ajouter `border border-gray-100` et `active:scale-[0.97]`

**`.category-pill.inactive`** — changer `bg-white` → `bg-gray-100`, `text-gray-700` → `text-gray-600`, `border-gray-200` → `border-gray-100`

- [ ] **Step 1: Modifier `.menu-card` dans globals.css**

Remplacer (lignes 39-42) :
```css
.menu-card {
  @apply bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer;
  @apply transition-all duration-200 hover:shadow-md hover:-translate-y-0.5;
}
```
Par :
```css
/* DESIGN IMPROVEMENT: border subtil + active state tactile mobile */
.menu-card {
  @apply bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer border border-gray-100;
  @apply transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97];
}
```

- [ ] **Step 2: Modifier `.category-pill.inactive` dans globals.css**

Remplacer (lignes 53-55) :
```css
.category-pill.inactive {
  @apply bg-white text-gray-700 border-gray-200 hover:border-amber-300;
}
```
Par :
```css
/* DESIGN IMPROVEMENT: fond gris clair, plus propre sur bg-gray-50 */
.category-pill.inactive {
  @apply bg-gray-100 text-gray-600 border-gray-100 hover:border-gray-300;
}
```

- [ ] **Step 3: Commit**
```bash
cd "C:\Users\FX507\Desktop\Client 2025\Woodiz Paris 14\Siteweb\Siteweb Woodiz Paris 14\appwodizof-main"
git add src/app/globals.css
git commit -m "design: refine menu-card border and category-pill inactive state"
```

---

## Task 2 — MenuHeader.tsx : backdrop-blur et search rounded-full

**Files:**
- Modify: `src/components/menu/MenuHeader.tsx:34,65`

- [ ] **Step 1: Changer le fond du header**

Remplacer la ligne 34 :
```tsx
    <header className="bg-white border-b border-gray-200 shadow-sm">
```
Par :
```tsx
    {/* DESIGN IMPROVEMENT: glassmorphism léger, cohérent avec les tabs sticky */}
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-100">
```

- [ ] **Step 2: Changer la barre de recherche en rounded-full**

Remplacer la ligne 65 :
```tsx
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
```
Par :
```tsx
            {/* DESIGN IMPROVEMENT: rounded-full moderne, cohérent app-native */}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
```

- [ ] **Step 3: Commit**
```bash
git add src/components/menu/MenuHeader.tsx
git commit -m "design: header backdrop-blur and search rounded-full"
```

---

## Task 3 — MenuClient.tsx : sticky tabs backdrop-blur et titres de section

**Files:**
- Modify: `src/components/menu/MenuClient.tsx:315,333,350,353`

### Sticky category tabs (ligne 353)

La div sticky existe déjà — on ajoute backdrop-blur et border-b.

- [ ] **Step 1: Mettre à jour la div sticky des category tabs**

Remplacer la ligne 353 :
```tsx
            <div className="sticky bg-gray-50 z-30 pt-3 pb-2 -mx-4 px-4" style={{ top: spacerH }}>
```
Par :
```tsx
            {/* DESIGN IMPROVEMENT: glassmorphism + border-b pour délimiter nav/contenu */}
            <div className="sticky z-30 pt-3 pb-2 -mx-4 px-4 backdrop-blur-md bg-white/90 border-b border-gray-100" style={{ top: spacerH }}>
```

### Titres de section — Featured (ligne 315)

- [ ] **Step 2: Titre section Featured**

Remplacer la ligne 315 :
```tsx
            <h2 className="text-lg font-bold text-gray-900 mb-4">{featuredTitle}</h2>
```
Par :
```tsx
            {/* DESIGN IMPROVEMENT: Playfair Display pour les titres de section */}
            <h2 className="font-display text-xl font-bold text-gray-900 tracking-tight mb-4">{featuredTitle}</h2>
```

### Titre section — Week Special (ligne 333)

- [ ] **Step 3: Titre section Week Special**

Remplacer la ligne 333 :
```tsx
            <h2 className="text-lg font-bold text-gray-900 mb-4">{weekTitle}</h2>
```
Par :
```tsx
            <h2 className="font-display text-xl font-bold text-gray-900 tracking-tight mb-4">{weekTitle}</h2>
```

### Titre section — Menu (ligne 350)

- [ ] **Step 4: Titre section Menu**

Remplacer la ligne 350 :
```tsx
              <h2 className="text-lg font-bold text-gray-900">{L.menu}</h2>
```
Par :
```tsx
              <h2 className="font-display text-xl font-bold text-gray-900 tracking-tight">{L.menu}</h2>
```

### Titre section catégorie — dans la grille (ligne 412)

- [ ] **Step 5: Titres catégorie dans la grille produits**

Remplacer la ligne 412 :
```tsx
                <h3 className="text-base font-bold text-gray-900">
```
Par :
```tsx
                {/* DESIGN IMPROVEMENT: Playfair pour les titres de catégorie */}
                <h3 className="font-display text-base font-bold text-gray-900 tracking-tight">
```

- [ ] **Step 6: Commit**
```bash
git add src/components/menu/MenuClient.tsx
git commit -m "design: sticky tabs backdrop-blur and section titles Playfair Display"
```

---

## Task 4 — ProductCard.tsx : description cachée mobile, espacement, prix

**Files:**
- Modify: `src/components/menu/ProductCard.tsx:140-157`

La version non-compact (`compact === false`) est la carte standard en grille. C'est celle qu'on modifie.

- [ ] **Step 1: Réduire le padding du contenu de p-3 à p-2.5**

Remplacer la ligne 140 :
```tsx
      <div className="p-3 flex-1 flex flex-col justify-between">
```
Par :
```tsx
      {/* DESIGN IMPROVEMENT: padding réduit pour plus de densité sur mobile */}
      <div className="p-2.5 flex-1 flex flex-col justify-between">
```

- [ ] **Step 2: Affiner le nom produit**

Remplacer la ligne 141 :
```tsx
        <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">{t?.name}</h3>
```
Par :
```tsx
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">{t?.name}</h3>
```

- [ ] **Step 3: Masquer la description sur mobile**

Remplacer la ligne 143 :
```tsx
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-snug">{t.description}</p>
```
Par :
```tsx
          {/* DESIGN IMPROVEMENT: masquée sur mobile pour réduire l'encombrement en grille 2 colonnes */}
          <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2 hidden sm:block">{t.description}</p>
```

- [ ] **Step 4: Réduire la taille du prix**

Remplacer la ligne 154 :
```tsx
          <span className="text-base font-black" style={{ color: darkenToContrast(primaryColor) }}>
```
Par :
```tsx
          {/* DESIGN IMPROVEMENT: taille cohérente text-sm, font-bold plutôt que font-black */}
          <span className="text-sm font-bold" style={{ color: darkenToContrast(primaryColor) }}>
```

- [ ] **Step 5: Commit**
```bash
git add src/components/menu/ProductCard.tsx
git commit -m "design: product card content refinements for mobile"
```

---

## Task 5 — CategoryTabs.tsx : images cachées sur mobile

**Files:**
- Modify: `src/components/menu/CategoryTabs.tsx:53`

Dans la branche `hasImages`, les icônes 56×56px prennent beaucoup de place sur mobile. On les cache et on ne garde que le texte + indicateur.

- [ ] **Step 1: Ajouter hidden sm:block sur le div image**

Remplacer la ligne 53 :
```tsx
              <div
                className="relative w-14 h-14 rounded-2xl overflow-hidden transition-all duration-250"
                style={{
                  transform: isActive ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: isActive
                    ? `0 4px 14px ${primaryColor}55, 0 2px 6px rgba(0,0,0,0.08)`
                    : '0 1px 4px rgba(0,0,0,0.08)',
                }}
              >
```
Par :
```tsx
              {/* DESIGN IMPROVEMENT: images cachées sur mobile → texte seul, plus compact pour QR code */}
              <div
                className="relative w-14 h-14 rounded-2xl overflow-hidden transition-all duration-250 hidden sm:block"
                style={{
                  transform: isActive ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: isActive
                    ? `0 4px 14px ${primaryColor}55, 0 2px 6px rgba(0,0,0,0.08)`
                    : '0 1px 4px rgba(0,0,0,0.08)',
                }}
              >
```

- [ ] **Step 2: Commit**
```bash
git add src/components/menu/CategoryTabs.tsx
git commit -m "design: hide category images on mobile for compact navigation"
```

---

## Task 6 — ReviewsSection.tsx : titre font-display

**Files:**
- Modify: `src/components/menu/ReviewsSection.tsx:46`

- [ ] **Step 1: Ajouter font-display au titre des avis**

Remplacer la ligne 46 :
```tsx
          <h2 className="text-lg font-bold text-gray-900">{L.reviews}</h2>
```
Par :
```tsx
          {/* DESIGN IMPROVEMENT: Playfair Display cohérent avec les autres sections */}
          <h2 className="font-display text-xl font-bold text-gray-900 tracking-tight">{L.reviews}</h2>
```

- [ ] **Step 2: Commit**
```bash
git add src/components/menu/ReviewsSection.tsx
git commit -m "design: reviews section title Playfair Display"
```

---

## Task 7 — MenuFooter.tsx : newsletter input rounded-full

**Files:**
- Modify: `src/components/menu/MenuFooter.tsx:211`

- [ ] **Step 1: Changer le newsletter input en rounded-full**

Remplacer la ligne 211 :
```tsx
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-white/8 placeholder-gray-600 focus:outline-none focus:ring-2 transition-all"
```
Par :
```tsx
                  {/* DESIGN IMPROVEMENT: rounded-full cohérent avec la barre de recherche du header */}
                  className="w-full px-4 py-2.5 rounded-full text-sm text-white bg-white/8 placeholder-gray-600 focus:outline-none focus:ring-2 transition-all"
```

- [ ] **Step 2: Commit**
```bash
git add src/components/menu/MenuFooter.tsx
git commit -m "design: newsletter input rounded-full in footer"
```

---

## Vérification finale

- [ ] Lancer `npm run dev` et ouvrir `/menu` sur mobile (DevTools → iPhone 14)
- [ ] Vérifier 2 colonnes en grille produits
- [ ] Vérifier que les tabs collent sous le header lors du scroll
- [ ] Vérifier que backdrop-blur fonctionne sur le header et les tabs
- [ ] Vérifier que les titres de section sont bien en Playfair Display
- [ ] Vérifier descriptions masquées sur mobile, visibles desktop
- [ ] Vérifier que la logique métier (search, filtre catégorie, modal produit) fonctionne

---

## Hors scope (non touché)

**AppOrderSection.tsx** — La section dark (`#0f172a`) est déjà bien stylée. Le spec mentionnait `bg-gray-50` mais la section dark est intentionnelle et de bonne qualité. Aucun changement.

**PromoSlider.tsx** — Le spec mentionnait des ajustements d'ombres et de dots. Non inclus dans ce plan car le composant est complexe (248 lignes) et les changements seraient mineurs par rapport au risque de casser la logique du carousel.

---

## Ce qui NE change PAS

- Logique search/filtre (MenuClient.tsx)
- IntersectionObserver (sync onglet actif au scroll)
- Couleurs dynamiques admin (CSS variables)
- Structure grille : `grid-cols-2 md:grid-cols-3 xl:grid-cols-5`
- Toutes les animations existantes
- Admin dashboard
- Appels API
