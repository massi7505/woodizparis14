# Design Refresh — Woodiz Paris 14 Menu Page

**Date:** 2026-04-03  
**Scope:** Page Menu uniquement (`/[locale]/menu`)  
**Approche:** Premium Refinement + éléments App-Native Mobile  
**Contrainte critique:** 2 colonnes fixes sur mobile, zéro changement logique métier

---

## Contexte

Le site Woodiz Paris 14 est une application Next.js de restaurant multi-langue (fr/en/it/es). La page Menu est la plus utilisée : elle est accédée à 80%+ via mobile, scannée via QR code en restaurant.

**Problème actuel :** La page est chargée visuellement, manque de hiérarchie, pas assez premium. Tout se ressemble, peu de respiration.

**Objectif :** Raffiner chaque composant sans toucher à la logique métier, pour obtenir un résultat minimaliste premium (Vercel/Linear/Notion style), optimisé mobile QR code.

---

## Palette & design tokens

- **Fond de page :** `bg-gray-50` (au lieu de `bg-white` pur) — plus doux, premium
- **Surfaces cartes :** `bg-white` sur fond `bg-gray-50` = contraste naturel sans ombres lourdes
- **Couleur primaire :** conservée dynamiquement depuis la DB (default amber `#F59E0B`)
- **Borders :** `border-gray-100` subtils, pas de borders lourdes
- **Ombres :** `shadow-sm` uniquement — pas de `shadow-lg` ou `shadow-xl`
- **Sections de fond alterné :** `bg-gray-50` pour distinguer AppOrderSection et ReviewsSection

---

## Section 1 — Typographie & espacement

### Règles typographiques
| Élément | Classe cible |
|---|---|
| Titres de section (ex: "Nos Pizzas") | `font-display text-xl font-bold tracking-tight mb-4` |
| Nom produit | `font-body text-sm font-semibold leading-tight` |
| Description produit | `text-xs text-gray-500` — masquée sur mobile (`hidden sm:block`) |
| Prix | `font-body text-sm font-bold` couleur primaire |
| Labels/badges | `text-[10px]` si trop larges à `text-xs` |

### Espacement
- Entre cartes produit : `gap-3` (au lieu de `gap-4`)
- Sections : `py-10` avec `pt-6` pour la première section
- Padding intérieur cartes : `p-2.5` sur mobile
- Entre titre section et grille : `mb-2` (serré, intentionnel)

**Fichiers :** `ProductCard.tsx`, `MenuClient.tsx`, `globals.css`

---

## Section 2 — Cartes produit (ProductCard)

### Image
- Ratio : `aspect-square` (au lieu de `aspect-[4/3]`) — propre en grille 2 col
- `object-cover` conservé
- `rounded-xl` sur l'image

### Surface
- `bg-white border border-gray-100 rounded-2xl shadow-sm`
- Hover : `hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`
- Active : `active:scale-[0.97]` — feedback tactile mobile

### Contenu
- Description masquée sur mobile : `hidden sm:block`
- Badges : conservés, taille ajustée si nécessaire
- Toute la carte cliquable (déjà le cas)

**Fichiers :** `ProductCard.tsx`, `globals.css` (`.menu-card`)

---

## Section 3 — Navigation catégories (CategoryTabs)

### Sticky
- `sticky top-[var(--header-height,4rem)]` — colle sous le header ; si la CSS variable n'existe pas, fallback à `4rem` (hauteur header estimée)
- `backdrop-blur-md bg-white/90` — glassmorphism léger
- `border-b border-gray-100` — délimitation nette

### Pills
| État | Classes |
|---|---|
| Inactif | `bg-gray-100 text-gray-600 rounded-full px-3.5 py-1.5 text-sm` |
| Actif | `bg-primary text-white rounded-full px-3.5 py-1.5 text-sm shadow-sm` |
| Transition | `transition-all duration-150` |

- Images de catégories : masquées sur mobile (`hidden sm:inline-block`), affichées à partir de `sm:` — texte seul sur mobile pour la lisibilité
- Scroll horizontal fluide, `scrollbar-hide` conservé
- Indicateur actif = background pill (plus robuste que underline)

**Fichiers :** `CategoryTabs.tsx`, `globals.css`

---

## Section 4 — Header (MenuHeader)

### Structure
- Sticky, `backdrop-blur-md bg-white/90`
- Hauteur compacte sur mobile
- Nom restaurant : `font-display` (Playfair)

### Barre de recherche
- `rounded-full bg-gray-100` sans border
- `focus:bg-white focus:ring-2 focus:ring-primary/20`
- Icône `text-gray-400`

### OrderModeBar
- Conservée fonctionnellement
- Pills compactes, affinées visuellement

**Fichiers :** `MenuHeader.tsx`

---

## Section 5 — Sections de contenu

### PromoSlider
- `rounded-2xl shadow-sm` (supprimer ombres lourdes)
- Overlay gradient `from-black/50 to-transparent` sur texte d'image
- Dots discrets, couleur primaire pour l'actif

### ReviewsSection
- Titre : `font-display`
- Cards avis : `bg-gray-50 rounded-2xl p-4 border border-gray-100`
- FAQ accordion : transitions existantes conservées

### AppOrderSection
- Boutons plateformes : `rounded-2xl`
- Layout : stack vertical mobile, 2 colonnes desktop
- Section background : `bg-gray-50`

### Séparations inter-sections
- Remplacer borders/`<hr>` par espace `py-8`

**Fichiers :** `PromoSlider.tsx`, `ReviewsSection.tsx`, `AppOrderSection.tsx`

---

## Section 6 — Footer & polish global

### MenuFooter
- `bg-gray-950` ou `bg-neutral-900`
- `text-gray-400` secondaire, `text-white` titres
- `py-12 px-4`
- Links : `hover:text-white transition-colors duration-150`
- Newsletter input : `rounded-full`

### Polish global
- Fond page : `bg-gray-50`
- Smooth scroll : `scroll-behavior: smooth` dans `globals.css`
- Cohérence `transition-all duration-200` sur toutes les cartes
- Skeletons : proportions matchent les nouvelles cartes `aspect-square`

**Fichiers :** `MenuFooter.tsx`, `globals.css`

---

## Fichiers modifiés (récapitulatif)

| Fichier | Changements |
|---|---|
| `src/components/menu/ProductCard.tsx` | aspect-square, border, shadow-sm, active state, description masquée mobile |
| `src/components/menu/CategoryTabs.tsx` | sticky, backdrop-blur, pills refaites, border-b |
| `src/components/menu/MenuHeader.tsx` | compact, backdrop-blur, search rounded-full |
| `src/components/menu/PromoSlider.tsx` | shadow-sm, overlay gradient, dots |
| `src/components/menu/ReviewsSection.tsx` | font-display titres, cards bg-gray-50 |
| `src/components/menu/AppOrderSection.tsx` | bg-gray-50, layout 2col desktop |
| `src/components/menu/MenuFooter.tsx` | dark bg, typographie, newsletter rounded-full |
| `src/app/globals.css` | bg-gray-50 page, smooth scroll, .menu-card update |
| `src/app/[locale]/menu/` page | gap-3, py-10 sections, titres font-display |

---

## Ce qui ne change PAS

- Logique métier (filtres, recherche, panier, commande)
- Appels API
- Internationalisation
- Couleurs dynamiques admin (CSS variables)
- Structure de fichiers
- Nombre de colonnes mobile (2 colonnes fixes)
- Animations existantes (shimmer, slideUp, fadeIn)
- Admin dashboard
