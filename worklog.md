# GOAL ZONE TV — Worklog

---

Task ID: RESTORE-1
Agent: full-stack-developer
Task: Restore complete GOAL ZONE TV site after accidental reset

## Work Log

### Prisma & Database
- prisma/schema.prisma — 5 models (Article, Subscriber, Like, Comment, SiteStats) with proper indexes, unique constraints and relations
- scripts/setup-db.js — kept existing auto-switch script (sqlite/postgresql/mysql detection)
- src/lib/db.ts — defensive Prisma singleton with try/catch on creation, dev/prod log split

### Domain libraries (src/lib)
- types.ts — Scope/Sport/Article/SiteStats/Comment types + SCOPE_META / SPORT_META
- format.ts — timeAgo (date-fns fr), formatDate, formatViews (1,2k / 1,5M), slugify (accent-aware), estimateReadMinutes
- social.tsx — SOCIAL_LINKS (FB/TikTok/X/WhatsApp) + CONTACT_INFO + custom TikTokIcon SVG component
- admin-store.ts — Zustand store persisted in sessionStorage (key `gztv-admin-open`)
- news-store.ts — Zustand store for query/scope/sport filters
- article-modal-store.ts — Zustand store for modal article state
- admin-auth.ts — server-side timing-safe password verification + HMAC SHA-256 session tokens (24h TTL) + isAuthorized() supporting both `x-admin-token` and `x-admin-password` headers

### Configuration
- .env — DATABASE_URL (sqlite), DATABASE_PROVIDER, NEXT_PUBLIC_SITE_URL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET
- .gitignore — added /db/*.db + /public/articles/ + /public/videos/
- package.json — scripts prebuild + postinstall (auto-run setup-db + prisma generate), dev tee to dev.log
- next.config.ts — typescript.ignoreBuildErrors, reactStrictMode=false, images.remotePatterns wildcard https
- src/app/globals.css — Tailwind 4 + blue king theme (primary #0047AB, destructive #E10E2C), .bg-king-blue, .bg-king-blue-dark, .bg-tricolor-bar, .bg-grid, .animate-marquee, .animate-pulse-dot, .scrollbar-thin, .text-balance, font-display Oswald
- src/app/layout.tsx — Geist + Geist_Mono + Oswald fonts, fr lang, full metadata (metadataBase, OG with logo.jpg, fr_CD locale, robots index/follow), Sonner toaster

### Public assets (generated via z-ai image CLI)
- /public/logo.jpg (1024×1024)
- /public/moise-kalala.jpg (864×1152 portrait)
- /public/articles/hero-football.png, provincial-lubumbashi.png, national-leopards.png (article reference but not used in seed since spec only listed 6), international-cls.png, basketball.png, boxe.png (1344×768 each)

### Site components (src/components/site)
- site-header.tsx — blue top bar (date + social + location), logo banner with tagline, desktop search, horizontal blue nav, mobile Sheet with hamburger
- live-ticker.tsx — red breaking-news marquee with duplicated items, pulse-dot animation
- hero.tsx — featured article (lg:col-span-2) with media overlay + scope/sport/breaking badges + "Lire l'article" button (opens modal) + secondary "Plus récents" column with 5 clickable items
- article-card.tsx — 3 variants (default/list/compact) with scope/breaking/video badges, hover effects, opens modal
- newsroom.tsx — scope/sport filter chips, search input, debounced fetch /api/articles, skeleton loading, error state, empty state
- football-focus.tsx — horizontal scrollable carousel of football articles
- stats-bar.tsx — blue king bar with 4 KPI stats
- journalist-profile.tsx — Moïse Kalala profile (photo, quote, bio, 4 stat cards, contact card)
- subscribe.tsx — newsletter form (name + email) → POST /api/subscribe with toast + success state
- share-site.tsx — Web Share API button + FB/X/WhatsApp/Copy fallback tiles
- site-footer.tsx — blue king dark footer with 5 columns (branding+socials, rubriques, RDC&Afrique, Europe, Reste du monde) + contact bar + legal links
- admin-panel.tsx — Dialog with login (POST /api/admin/login → token in localStorage), tabs "Publier" (full form: title, excerpt, content, scope, sport, location, source, image upload via file input ref + URL + IA generation, video upload + URL, featured/breaking checkboxes) + "Mes articles" (list with delete + media download), draft persisted to localStorage `gztv-draft-v1`, blocks close during uploading/saving via onPointerDownOutside/onInteractOutside/onEscapeKeyDown preventDefault
- admin-launcher.tsx — mounts AdminPanel via useAdminStore, Ctrl+Shift+E shortcut, no floating button
- article-modal.tsx — detailed modal with media (video/image), title, badges, meta, content paragraphs, like button (POST /api/articles/[slug]/like), comments (GET/POST /api/articles/[slug]/comments), share buttons (FB/X/WhatsApp/Copy)

### API routes (src/app/api)
- /api/articles — GET (scope/sport/search/featured/breaking/limit/offset filters) + POST (create, isAuthorized, slugify) + DELETE (id, isAuthorized)
- /api/articles/[slug] — GET detail with view increment
- /api/articles/[slug]/like — POST toggle (fingerprint = sha256(IP+UA) slice 32), GET state
- /api/articles/[slug]/comments — GET approved list + POST (name/content validation)
- /api/admin-articles — GET all (isAuthorized)
- /api/admin/login — POST password → JWT-like session token (HMAC SHA-256)
- /api/seed — POST inserts 9 demo articles (Mazembe derby, LINAFOOT, CAF CL, basket, boxe, mercato, athlé, CHAN, Premier League) if DB empty
- /api/subscribe — POST newsletter (email validation, dedup, reactive inactive subscribers, increment SiteStats)
- /api/stats — GET followers + articlesCount + breakingCount
- /api/upload — POST multipart (image ≤15 Mo or video ≤100 Mo), saves to /public/articles or /public/videos, isAuthorized
- /api/generate-image — POST generates IA image via z-ai-web-dev-sdk (1344x768), saves /public/articles/gen-*.png, isAuthorized

### Pages
- src/app/page.tsx — server component, dynamic='force-dynamic', getData() with try/catch fallback, auto-seeds on first visit if empty, renders SiteHeader → LiveTicker → Hero → StatsBar → FootballFocus → Newsroom → JournalistProfile → Subscribe → ShareSite → SiteFooter → AdminLauncher → ArticleModal
- src/app/sitemap.ts — dynamic with articles
- src/app/robots.ts — allow /, disallow /api/ and /admin, sitemap URL
- src/app/mentions-legales/page.tsx — full legal page (éditeur Moïse Kalala, hébergeur, propriété intellectuelle, droit RDC)
- src/app/politique-confidentialite/page.tsx — full privacy policy (RGPD-like, droits utilisateur, cookies)
- src/app/articles/[slug]/page.tsx — shareable article page with generateMetadata (OG/Twitter/canonical), breadcrumb, badges, meta, media, content, related articles (same sport)

## Stage Summary

- **Lint**: `bun run lint` → 0 errors, 0 warnings
- **Build**: `bun run build` → ✓ Compiled successfully in 9.0s
- **Routes compiled**: 19 (1 homepage + 1 article page + 2 legal pages + 2 dynamic (sitemap/robots) + 11 API routes + 1 not-found + 1 /api stub)
- **DB push**: ✓ schema synced, 9 demo articles seeded
- **Runtime checks**: all API endpoints tested live (GET/POST/DELETE for articles, like toggle, comments, subscribe, stats, admin login with JWT, upload, IA image generation, legal pages, sitemap.xml, robots.txt, article detail page with related articles)
- **Public assets**: logo.jpg, moise-kalala.jpg, 5 article images all served (HTTP 200)
- **Admin shortcut**: Ctrl+Shift+E opens/closes admin panel
- **Demo data**: 9 articles seeded automatically on first homepage visit (Lubumbashi football, LINAFOOT, CAF CL, basketball, boxe, mercato, athlétisme, CHAN, Premier League)

Site is fully functional and ready for journalist Moïse Kalala to log in (Ctrl+Shift+E, password `KalalaGoalZone2024`) and publish new content.
