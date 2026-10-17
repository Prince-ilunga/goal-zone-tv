# Task ID: LIVE-SCORES-C
# Agent: full-stack-developer (Option C — real scores via API-Football + manual LINAFOOT)

## Summary
Implemented live scores for GOAL ZONE TV using **Option C**: real international football scores from API-Football v3 (100 req/day quota managed via 10-minute in-memory cache) + manual LINAFOOT/Provincial/RDC scores managed by Moïse Kalala through the admin panel.

## Files created
1. `src/lib/api-football.ts` — API-Football v3 helper
   - Base URL `https://v3.football.api-sports.io`, header `x-apisports-key`
   - `LEAGUES` constant (PL=39, La Liga=140, Serie A=135, Bundesliga=78, Ligue 1=61, CAF CL=566, CAN=38)
   - `LEAGUE_LABELS` reverse lookup
   - `TRACKED_LEAGUE_IDS` array (used to filter "today" feed)
   - In-memory `Map` cache with 10-minute TTL (`CACHE_TTL_MS = 10 * 60 * 1000`)
   - `fetchFixturesByDate(date)` → GET /fixtures?date=YYYY-MM-DD
   - `fetchLiveFixtures()` → GET /fixtures?live=all
   - `fetchFixturesByLeague(leagueId, date)` → GET /fixtures?league=&date=
   - `getCachedFixtures({ live, league, date })` returns `{ matches, cached }`
   - `normaliseFixture()` maps API status codes → `live|finished|upcoming` (1H/2H/ET/P/HT → live, FT/AET/PEN → finished, NS/TBD → upcoming)
   - `todayDate()` helper
   - Returns `FixtureMatch[]` — never throws (empty array on failure)

2. `src/app/api/scores/route.ts` — GET /api/scores
   - `?manual=true` → DB matches ordered by status then date desc
   - `?live=true` → API-Football live fixtures (cached 10 min)
   - `?league=ID&date=YYYY-MM-DD` → fixtures for that league on that date (cached)
   - `?date=YYYY-MM-DD` → all fixtures on that date, filtered to tracked leagues
   - Default → today's fixtures across all tracked leagues
   - Response: `{ matches, source: 'api-football'|'manual', cached: boolean, updatedAt: ISO }`
   - `force-dynamic` + `revalidate = 0`

3. `src/app/api/matches/route.ts` — Manual matches CRUD
   - GET (public) → list manual matches, optional `?status=live|finished|upcoming`
   - POST (isAuthorized) → create, validates competition/homeTeam/awayTeam
   - PUT `?id=` (isAuthorized) → partial update
   - DELETE `?id=` (isAuthorized) → delete
   - Exports `DEFAULT_COMPETITIONS` (LINAFOOT, Ligue Provinciale Haut-Katanga, Coupe du Congo, Super Coupe RDC, CHAN, Coupe CAF, Autre)

4. `src/app/scores/page.tsx` — Server component dedicated page
   - Metadata: title "Scores en direct — GOAL ZONE TV", canonical `/scores`
   - Renders SiteHeader + LiveTicker (breaking articles) + ScoresTabs + SiteFooter
   - Blue king hero section with pulsing red dot ("TEMPS RÉEL · API-FOOTBALL")
   - `force-dynamic`

5. `src/components/site/scores-tabs.tsx` — Client component with 4 tabs
   - **En direct** — fetches /api/scores?live=true + /api/matches?status=live, merges, auto-refresh every 60s
   - **Aujourd'hui** — fetches /api/scores?date=today, auto-refresh 60s
   - **International** — sub-tabs by league (Premier League 🏴, La Liga 🇪🇸, Serie A 🇮🇹, Bundesliga 🇩🇪, Ligue 1 🇫🇷, CAF CL 🌍, CAN 🌍), each fetches /api/scores?league=ID&date=today
   - **LINAFOOT & RDC** — fetches /api/matches, note "Scores saisis par GOAL ZONE TV"
   - Each match card: competition badge, teams, scores, minute/status, live pulsing red dot
   - Loading skeletons (grid of cards), error states with retry button, empty states per tab
   - SubHeader with cache badge + updatedAt time + refresh button
   - `force-dynamic`-free, uses `cache: 'no-store'`

## Files modified
6. `src/components/site/live-scores.tsx` (REPLACED)
   - Removed all `DEMO_MATCHES` hardcoded data
   - Removed "bientôt connectés à API-Football" disclaimer text
   - Now fetches `/api/scores?live=true` (API-Football) + `/api/matches?status=live` (manual)
   - Combines both sources, keeps top 4 live matches
   - Auto-refresh every 60 seconds
   - Empty state: "Aucun match en direct maintenant" with CalendarDays icon + link to /scores
   - "Voir tous les scores →" link in the header
   - Loading skeleton cards (4 pulsing placeholders)
   - Final footer: "⚽ Scores temps réel via API-Football · LINAFOOT & ligues provinciales par GOAL ZONE TV"

7. `src/components/site/admin-panel.tsx`
   - Added imports: Trophy, Pencil, X icons
   - Added `AdminMatch` interface, `MATCH_COMPETITIONS`, `MATCH_STATUSES`, `MATCH_DRAFT_DEFAULT`
   - Added state: `matchDraft`, `matches`, `matchesLoading`, `matchSaving`, `editingMatchId`
   - Added functions: `fetchMatches()`, `resetMatchDraft()`, `onEditMatch()`, `onSubmitMatch()` (POST or PUT), `onDeleteMatch()`
   - Added third tab "Scores" between "Publier" and "Mes articles" (with Trophy icon, `data-tab-trigger="scores"`)
   - Form fields: competition select, datetime-local, homeTeam/awayTeam, homeScore/awayScore (number), status select, minute
   - List of existing matches with edit/delete buttons (scrollable max-h-72 with custom scrollbar)
   - Edit mode: clicking "Modifier" loads the match into the form, switches to scores tab
   - Toast on success/error (sonner)

8. `src/app/page.tsx`
   - Imported `Link` from next/link, `ArrowRight` from lucide-react
   - Added "Voir tous les scores →" link below the LiveScores section in a secondary container

9. `src/app/sitemap.ts`
   - Added `/scores` static entry with `changeFrequency: 'always'` and `priority: 0.9`

10. `src/lib/db.ts` (defensive update)
    - Added `PRISMA_CACHE_VERSION = 'v2-match-model'` constant
    - Added `getDb()` function that checks `cachedVersion === PRISMA_CACHE_VERSION` to invalidate the singleton when the Prisma schema changes structurally (new models added)
    - Removed the noisy `query` log level (kept only `error` + `warn`)
    - This was needed because the long-running dev server had a stale Prisma client (without Match model) cached in `globalThis.prisma`

## Verification results

### Lint
`bun run lint` → 0 errors, 0 warnings

### Dev server
- Port 3000 listening (PID 11410, next-server v16.1.3)
- Fresh dev server started after killing the stale Oct-16 instance which had an outdated Prisma client

### Endpoint tests
| Endpoint | Method | Status | Notes |
|---|---|---|---|
| `/api/scores?live=true` | GET | 200 | Returns real API-Football live fixtures (Vega Real, Mirassol, Supra du Quebec, Colón, Sport Recife, etc.) |
| `/api/scores?league=39&date=2026-10-17` | GET | 200 | Premier League fixtures (empty today — no PL matches) |
| `/api/scores?date=2026-10-17` | GET | 200 | All today's fixtures filtered to tracked leagues (Primera División, Serie A, etc.) |
| `/api/scores?manual=true` | GET | 200 | Empty initially |
| `/api/matches` | GET | 200 | `{matches:[], count:0, competitions:[...]}` |
| `/api/matches` (auth) | POST | 200 | Created LINAFOOT Mazembe 2-1 V.Club |
| `/api/matches?id=xxx` (auth) | PUT | 200 | Updated to Mazembe 3-1 V.Club finished 89' |
| `/api/matches?id=xxx` (auth) | DELETE | 200 | `{success:true}` |
| `/scores` | GET | 200 | Page renders "Scores en direct" + "TEMPS RÉEL · API-FOOTBALL" hero + ScoresTabs component |
| `/` (homepage) | GET | 200 | Renders "Voir tous les scores →" link; NO "DEMO_MATCHES" / "bientôt connectés" text in HTML |

### Build
- Build (`bun run build`) not run per system instructions ("Never use `bun run build`")
- All routes compiled cleanly in dev (Turbopack): homepage 100ms, /scores 866ms (initial compile), /api/scores?live=true 741ms

### Architecture decisions
1. **Cache TTL = 10 minutes**: API-Football free plan = 100 req/day. With 10-min cache and ~5 distinct endpoints (live, today, 7 leagues) = ~96 req/day worst case. The cache also serves subsequent identical requests for free.
2. **Graceful failure**: `fetchApi()` returns `null` on any error (network, HTTP non-200, JSON parse). `normaliseFixture()` filters out malformed entries. Endpoints return empty arrays rather than crashing.
3. **Combined live feed**: homepage `/api/scores?live=true` (international) + `/api/matches?status=live` (manual). Manual live matches take precedence in the merged array (so LINAFOOT shows first).
4. **DB cache invalidation**: `PRISMA_CACHE_VERSION` constant in `db.ts` lets us invalidate the singleton when the Prisma schema changes structurally — useful when the dev server has been running for hours and the Prisma client gets regenerated by `prisma db push`.
5. **Sort order**: live first, then upcoming, then finished (per the requirement).
6. **Auth**: All write operations (POST/PUT/DELETE) require `isAuthorized(req)` which accepts either `x-admin-token` (preferred) or `x-admin-password` (legacy).
7. **SEO**: `/scores` page has its own metadata with canonical URL and OpenGraph tags, plus sitemap entry with `changeFrequency: 'always'` (high-frequency updates) and priority 0.9.

### Files NOT changed
- `prisma/schema.prisma` — Match model was already present (added by previous task)
- `src/lib/admin-auth.ts` — `isAuthorized()` already supports both token and password headers
- All shadcn/ui components — used as-is (Tabs, Badge, Button, Input, Select, Label, Skeleton)
