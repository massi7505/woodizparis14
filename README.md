# 🍕 Woodiz App — Next.js 15 Full Stack

Application complète pour pizzeria avec **Linktree personnalisable**, **menu catalogue multilingue** et **panel admin** complet.

---

## 🚀 Stack technique

| Technologie | Usage |
|------------|-------|
| **Next.js 15** | App Router, Server Components, API Routes |
| **MySQL + Prisma** | Base de données relationnelle |
| **Vercel Blob** | Stockage images/vidéos automatique |
| **next-intl** | i18n FR 🇫🇷 / EN 🇬🇧 / IT 🇮🇹 / ES 🇪🇸 |
| **JWT (jose)** | Authentification admin httpOnly cookies |
| **Tailwind CSS** | Styles + CSS Variables dynamiques |

---

## 📦 Installation rapide

### 1. Cloner et installer

```bash
git clone <votre-repo> woodiz-app
cd woodiz-app
npm install
```

### 2. Variables d'environnement

```bash
cp .env.example .env
```

Remplir `.env` :
```env
# MySQL (Hostinger, PlanetScale, Railway, etc.)
DATABASE_URL="mysql://user:password@host:3306/woodiz_db"

# Sécurité JWT (changer en production !)
JWT_SECRET="mon-secret-super-securise-2024"

# Vercel Blob (depuis dashboard.vercel.com > Storage > Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxxxxxx"

# URL du site
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 3. Base de données

```bash
# Créer les tables
npm run db:push

# Remplir avec les données Woodiz
npm run db:seed
```

> **Credentials admin par défaut :**
> - Email : `admin@woodiz.fr`
> - Mot de passe : `ChangeMe123!`

### 4. Lancer

```bash
npm run dev
```

---

## 🌐 URLs

| Page | URL |
|------|-----|
| Linktree (accueil) | `localhost:3000/linktree` |
| Menu catalogue | `localhost:3000/menu` |
| Linktree EN | `localhost:3000/en/linktree` |
| Menu IT | `localhost:3000/it/menu` |
| Admin Dashboard | `localhost:3000/admin` |
| Admin Login | `localhost:3000/admin/login` |

---

## 🗂️ Structure du projet

```
woodiz-app/
├── prisma/
│   ├── schema.prisma        # 14 modèles MySQL
│   └── seed.ts              # Données Woodiz complètes
│
├── messages/
│   ├── fr.json              # 🇫🇷 Français (défaut)
│   ├── en.json              # 🇬🇧 English
│   ├── it.json              # 🇮🇹 Italiano
│   └── es.json              # 🇪🇸 Español
│
└── src/
    ├── app/
    │   ├── [locale]/
    │   │   ├── page.tsx           # → redirect vers linktree ou menu
    │   │   ├── linktree/page.tsx  # 🔗 Page Linktree publique
    │   │   └── menu/page.tsx      # 🍕 Page Menu catalogue
    │   │
    │   ├── admin/
    │   │   ├── page.tsx           # 📊 Dashboard
    │   │   ├── linktree/          # Boutons, cover, profil
    │   │   ├── menu/              # Catégories & produits
    │   │   ├── promotions/        # Offres & promos
    │   │   ├── reviews/           # Avis Google
    │   │   ├── faqs/              # Questions fréquentes
    │   │   ├── hours/             # Horaires d'ouverture
    │   │   ├── notification/      # Barre de notification
    │   │   └── settings/          # SEO, couleurs, logo
    │   │
    │   └── api/
    │       ├── settings/          # GET/PATCH paramètres
    │       ├── linktree/          # CRUD boutons
    │       ├── menu/              # CRUD catégories & produits
    │       ├── promotions/        # CRUD promotions
    │       ├── reviews/           # CRUD avis
    │       ├── faqs/              # CRUD FAQs
    │       ├── hours/             # Horaires
    │       ├── notification/      # Barre de notif
    │       ├── upload/            # Upload → Vercel Blob
    │       ├── reorder/           # Tri drag & drop
    │       └── admin/login|logout # Authentification
    │
    ├── components/
    │   ├── linktree/              # Cover, Buttons, Hours, Promos, FAQs...
    │   ├── menu/                  # Header, Cards, Modal, PromoSlider...
    │   └── admin/                 # Sidebar, ImageUploader, ColorPicker
    │
    ├── i18n/                      # Config next-intl
    └── lib/
        ├── db.ts                  # Prisma singleton
        ├── auth.ts                # JWT (jose)
        └── blob.ts                # Vercel Blob helpers
```

---

## ✨ Fonctionnalités

### 🔗 Linktree personnalisable
- Cover : image, vidéo, ou couleur unie
- Profil : logo, nom, sous-titre, message d'info
- Boutons : couleur, icône SVG/emoji/image, style (filled/outline/ghost)
- Regroupement par sections (Commander, Contact, Découvrir...)
- Ordre drag & drop dans l'admin
- Horaires d'ouverture avec jour actuel mis en évidence
- Promos connectées (cards colorées avec prix barré)
- FAQs accordéon
- Sélecteur de langue FR/EN/IT/ES

### 🍕 Menu catalogue
- Header sticky avec recherche en temps réel
- Slider promotions défilant
- Produits en vedette & produit de la semaine
- Tabs de navigation par catégorie
- Grille responsive : **5 colonnes desktop / 3 tablette / 2 mobile**
- Modal produit : image, description multilingue, allergènes iconifiés, prix
- Section avis Google avec étoiles et note moyenne
- FAQs accordéon
- Footer complet multicolonne
- Détection automatique de la langue du navigateur

### ⚙️ Panel admin
- **Dashboard** : stats en temps réel, accès rapide
- **Linktree** : gestion complète des boutons + settings cover/profil
- **Menu** : catégories avec emoji/icône, produits avec allergènes & badges
- **Promotions** : fond couleur/dégradé/image, type livraison/emporter/place
- **Avis Google** : ajout manuel, note, avatar coloré, source
- **FAQs** : multilingue, visible sur linktree et/ou menu
- **Horaires** : plages horaires multiples par jour
- **Barre de notification** : couleur, texte multilingue, lien
- **Paramètres** : SEO, couleurs (5 variables), logo, favicon, page d'accueil

### 🌍 Internationalisation
- Détection auto langue navigateur (Accept-Language header)
- FR 🇫🇷 (défaut, sans préfixe URL) | EN 🇬🇧 | IT 🇮🇹 | ES 🇪🇸
- Traductions : noms, descriptions, questions, réponses, promos, FAQs
- Sélecteur de langue visible sur toutes les pages publiques

### 📸 Upload d'images
- Drag & drop ou clic pour uploader
- Upload automatique vers **Vercel Blob**
- Supporte : JPG, PNG, WebP, GIF, SVG, MP4, WebM
- Taille max : 20 MB
- Possibilité de coller une URL directement

---

## 🚢 Déploiement

### Vercel (recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

Variables d'environnement à configurer dans le dashboard Vercel :
- `DATABASE_URL`
- `JWT_SECRET`
- `BLOB_READ_WRITE_TOKEN`
- `NEXT_PUBLIC_BASE_URL`

### Hostinger (Node.js hosting)

```bash
# Build
npm run build

# Démarrer avec PM2
pm2 start npm --name "woodiz" -- start
pm2 save
```

> ⚠️ Vercel Blob nécessite une connexion Internet. Sur Hostinger, assurez-vous que les requêtes sortantes vers `*.vercel-storage.com` sont autorisées.

---

## 🛠️ Commandes utiles

```bash
npm run dev          # Développement (Turbopack)
npm run build        # Build production
npm run start        # Démarrer en production
npm run db:push      # Appliquer le schéma Prisma
npm run db:seed      # Seed données initiales Woodiz
npm run db:studio    # Prisma Studio (GUI base de données)
```

---

## 🔐 Sécurité

- Authentification admin via **JWT httpOnly cookies** (7 jours)
- Toutes les routes API admin vérifient le token avant chaque opération
- Mots de passe hashés avec **bcryptjs** (salt rounds: 12)
- Variables sensibles dans `.env` (jamais dans le code)

---

*Développé pour Woodiz Paris 15 — 93 Rue Lecourbe, 75015 Paris*
