# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Next.js dev server with Turbopack

# Build & production
npm run build        # prisma generate + next build
npm run start        # production server

# Database (Supabase/PostgreSQL)
npm run db:push      # push schema changes (uses DIRECT_URL)
npm run db:studio    # Prisma Studio GUI
npm run db:seed      # seed initial data (tsx prisma/seed.ts)

# Linting
npm run lint
```

No test suite configured — there are no test files in this project.

## Environment Variables

Required in `.env` (see `.env.example`):
- `DATABASE_URL` — Supabase transaction pooler (port 6543, pgbouncer=true)
- `DIRECT_URL` — Supabase direct connection (port 5432, used by `prisma db push`)
- `JWT_SECRET` — signs admin httpOnly cookies
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob (image/video uploads)
- `NEXT_PUBLIC_BASE_URL` — canonical URL for SSR metadata
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase JS client

## Architecture

### Stack
- **Next.js 15** App Router, React 19, TypeScript 5, Turbopack
- **Prisma 5** + **Supabase (PostgreSQL)** — 20 models, all via `src/lib/db.ts` singleton
- **next-intl** — i18n with `[locale]` folder pattern (FR default at `/`, others at `/[locale]/`)
- **Vercel Blob** — all media uploads (images, videos, favicons)
- **Tailwind CSS 3** — CSS variable theming; 5 site colors controlled from admin
- **jose** — JWT HS256 for admin session; `admin_token` httpOnly cookie, 7-day expiry

### Route Layout

```
/                        → redirects to /linktree or /menu (admin setting)
/linktree                → public linktree page (FR)
/menu                    → public menu page (FR)
/menu/[category]/[product] → individual product SEO page (FR)
/notre-histoire          → story/about page (FR)
/legal/[slug]            → legal pages
/[locale]/*              → same pages for en/it/es
/admin/*                 → protected admin panel (JWT required)
/api/*                   → REST-style route handlers
```

### Data Flow — Menu Page

`src/app/menu/page.tsx` (Server Component, revalidate: 30s)
→ calls `fetchMenuCoreData()` + `fetchMenuSecondaryData()` + `fetchHeroData()` from `src/lib/menu-data.ts`
→ passes serialized data to `<MenuClient>` (Client Component)
→ MenuClient owns all interactive state: active category, search, modal, scroll sync

All Prisma results pass through serialization helpers in `menu-data.ts` because Prisma `Decimal` and `Date` types are not JSON-serializable. Use `parseFloat(price.toString())` pattern, never pass raw Prisma objects to client components.

### Admin Panel

`/admin` — single admin user, login via email+password → JWT cookie
All `/admin/:path+` routes (except `/admin/login`) are protected by `middleware.ts`.

**Auth in route handlers**: use `getSessionFromReq(req)` (reads from `req.cookies`).
**Auth in Server Components**: use `getSession()` (reads from `next/headers` cookies).

### i18n

French routes have no locale prefix. The middleware does **not** handle locale detection — `next-intl` does it via `src/i18n/request.ts`. When adding a new page:
- Create `src/app/page-name/page.tsx` for French
- Create `src/app/[locale]/page-name/page.tsx` for other locales
- Add translations to `messages/{fr,en,it,es}.json`

### SEO Helpers (`src/lib/seo.ts`)

- `getCachedSeoSettings()` — cached Prisma fetch, tag `site-settings`, revalidates with `revalidateTag('site-settings')`
- `buildSeoBase(settings)` — extracts all SEO fields with fallbacks
- `buildSharedMeta(seo, pageUrl)` — returns Next.js `Metadata` for OG + Twitter

For product pages use `Schema.org` `MenuItem` + `BreadcrumbList` JSON-LD inline in the page component.

### CSP / Security

`middleware.ts` generates a per-request nonce and sets a strict CSP (`nonce + strict-dynamic`). Any `<script>` tag added manually must carry `nonce={nonce}` — get it from the `x-nonce` request header. Inline `<script type="application/ld+json">` is exempt (not executable JS).

### Admin Settings → Public Pages

Site-wide config lives in a single `SiteSettings` row (id=1). Public pages read it at render time. After any PATCH to `/api/settings`, the route handler calls `revalidatePath('/', 'layout')` and `revalidateTag('site-settings')` to invalidate cached data.

Notable runtime-controlled features:
- `orderButtonEnabled` / `orderButtonLabel` / `orderButtonUrl` — "Commander" CTA in menu header + product pages
- `showFeatured` / `showWeekSpecial` — featured product sections
- `homePage` — which page `/` redirects to
- `primaryColor` / `secondaryColor` etc. — injected as CSS variables

### Image Uploads

Always use `<ImageUploader>` component (admin) which calls `POST /api/upload` → Vercel Blob → returns URL.
Use `<SecureImage>` or Next.js `<Image>` with `src` from Blob URLs (all `*.public.blob.vercel-storage.com` are whitelisted in `next.config.ts`).

### Prisma Notes

- Never add `prisma migrate deploy` to the build script — run `prisma db push` locally after schema changes, then regenerate the client with `prisma generate` (already in `npm run build`).
- After adding fields to `SiteSettings`, also update `DEFAULT_SETTINGS` in `src/app/admin/settings/page.tsx` to keep the form from resetting new fields to `undefined`.
- Decimal fields from Prisma must be serialized: `parseFloat(value.toString())`.
- The `prisma as any` cast pattern in `menu-data.ts` exists for models added after initial client generation — after `prisma generate` you can remove the cast.
