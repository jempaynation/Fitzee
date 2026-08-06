# Architecture — Fitzee

> **v1 platform: web app.** No app store deployment, no developer account fees, no review process — ship by hosting static files on a free host. Native (iOS/Android) wrapping is a possible *future* step (see `FUTURE_IMPROVEMENTS.md`), not part of v1. This doc supersedes any earlier Flutter/native-first version.

## Stack
- **Framework:** React + Vite (or Next.js in static-export mode — either is fine; Vite is simpler for a pure client-side app with no server needs). TypeScript recommended for a project this data-model-heavy.
- **Rendering for puzzle pieces:** a hybrid Canvas + DOM engine. Canvas clips and
  pre-renders every interlocking piece once per puzzle session; semantic DOM
  buttons position those cached bitmaps and own Pointer Events, keyboard focus,
  screen-reader labels, and tap-to-place. This keeps drag frames to compositor
  transforms without sacrificing accessible input.
- **Local storage:** browser `IndexedDB` via `idb` for typed, promise-based structured local data (progress, rewards, settings). No backend/server required for v1 — see Non-Goals in `docs/PRD.md`. Do not use `localStorage` directly for structured records; it's synchronous and size-limited, IndexedDB is the right fit.
- **Routing:** a small browser-native React hash-navigation provider. Hash routes are
  deliberate because the production host is static GitHub Pages and has no SPA
  rewrite layer; refreshing a nested screen therefore still serves the app shell.
  Phase 0 needs only fixed local routes, links, redirects, and back navigation, so
  avoiding a full router dependency keeps the child-facing app shell smaller and
  removes unused server/RSC code paths.
- **Audio:** native `<audio>` elements or the Web Audio API for narration/sound cues.
- **Offline support:** implement as a **PWA** (Progressive Web App) with a service worker caching all app shell + puzzle assets, so it works with no internet after first load and can be "installed" to a home screen on mobile/tablet without any app store. See PWA section below.
- **Hosting:** GitHub Pages on the free tier at `https://jempaynation.github.io/Fitzee/`, deployed from `main` by `.github/workflows/deploy-pages.yml`. Pull requests and all pushes run lint + test + build checks through `.github/workflows/ci.yml`; pushes to `main` also publish the production `dist/` artifact. The deployment build uses `/<repository-name>/` as Vite's base path, so future routing and asset URLs must respect `import.meta.env.BASE_URL`. GitHub Pages was selected because it keeps source hosting, CI, and static deployment in one zero-cost service with no backend or separate hosting credentials.
- **Analytics (if added):** must be a COPPA-safe, non-behavioral, non-cross-app-tracking provider, and must not fire outside Parent Zone context for anything purchase/identity related. Confirm against `docs/COMPLIANCE.md` before integrating any analytics script. Note: web analytics have *more* privacy pitfalls than app analytics (cookies, IP logging, fingerprinting) — see `docs/COMPLIANCE.md` for web-specific rules.
- **Content Security Policy:** production and development use a self-only connection
  policy. No remote or localhost WebSocket exception ships in `index.html`; Vite's
  same-origin development connection remains covered by `'self'`.

## Why web-first
- **Zero deployment cost**: no $99/yr Apple Developer fee, no $25 one-time Google Play fee, no app review cycles — you can ship and iterate same-day.
- **Cross-platform for free**: one codebase runs on any device with a modern browser (desktop, tablet, phone) — no separate iOS/Android builds needed to reach users.
- **Still installable**: a PWA can be "Added to Home Screen" on iOS and Android, giving an app-like icon and full-screen experience without ever touching an app store.
- **Clean future path**: if/when there's budget, the same core logic (puzzle engine, data model, content) can be wrapped with Capacitor or React Native WebView, or ported to Flutter/RN, to reach app stores — see `FUTURE_IMPROVEMENTS.md`.

## Folder structure
```
src/
├── main.tsx
├── App.tsx                        # root component, routing, theme provider
├── core/
│   ├── theme/                     # design tokens from docs/UI_UX_GUIDELINES.md
│   ├── constants/                  # tier definitions, category IDs (mirror docs/CONTENT_SPEC.md exactly)
│   └── utils/
├── data/
│   ├── models/                     # UserSettings, PuzzleProgress, Reward types — mirror docs/DATA_MODEL.md
│   ├── repositories/                # IndexedDB read/write, one module per model
│   └── db/                          # Dexie/idb schema + migrations
├── features/
│   ├── home/
│   ├── categories/
│   ├── puzzle-engine/                # see docs/PUZZLE_ENGINE.md — piece cutting, drag/snap, rotation logic
│   ├── my-puzzles/
│   ├── rewards/
│   ├── parent-zone/
│   │   ├── gate/                     # math-check / gesture gate, see docs/COMPLIANCE.md
│   │   ├── settings/
│   │   └── billing/                  # deferred — see docs/COMPLIANCE.md monetization notes for web
│   └── settings/
├── assets/
│   ├── puzzles/
│   │   └── {category}/{tier}/{puzzle_id}/   # source image + metadata, see docs/CONTENT_SPEC.md
│   ├── audio/
│   │   ├── narration/{locale}/
│   │   └── sfx/
│   └── icons/
├── i18n/                            # localization strings, audio narration mapping
└── service-worker.ts                # PWA offline caching
public/
├── manifest.json                    # PWA manifest (name, icons, theme color, display: standalone)
└── icons/                           # home-screen icons at required sizes
```

## Module boundaries (important for agents)
- `puzzle-engine` must not know about categories/content — it takes an image + piece count + tier config and renders a playable puzzle. Content is injected, not hardcoded.
- `parent-zone/billing` is the **only** module allowed to initiate any payment flow, if/when one exists. No other module may reference payment APIs directly.
- `data/repositories` is the only layer allowed to touch IndexedDB directly. Features read/write through repositories, never raw DB calls in UI components.

## Asset pipeline
- Each puzzle = one source image + a metadata file (category, tier, recommended piece count, alt-text for narration). Store metadata as structured data (JSON) alongside the image so content can be added without code changes — see `docs/CONTENT_SPEC.md` for the schema.
- `src/data/content/puzzleCatalog.ts` discovers metadata and source images with
  `import.meta.glob`; feature code queries the resulting catalog by canonical
  category/tier IDs and never imports individual puzzles.
- Piece-cutting is done **at runtime** in the browser (canvas `getImageData`/clipping paths) from the source image, not pre-cut assets, so the same source image can serve multiple tiers at different piece counts. See `docs/PUZZLE_ENGINE.md`.
- Keep image assets web-optimized (WebP with PNG fallback, reasonable compression) — page-load performance matters more on the web than in a pre-installed app bundle, especially for users on mobile data.

## PWA / offline behavior
- Service worker pre-caches the app shell (JS/CSS) and all MVP puzzle assets on first visit.
- After first load, the app must be fully playable with no network connection.
- `public/manifest.json` must define `display: "standalone"`, app icons, and theme colors so "Add to Home Screen" produces an app-like icon/splash, not a browser-chrome bookmark.
- Workbox revisions every precached URL on each deploy. An updated worker waits
  until existing Fitzee tabs close before activation, so an in-progress puzzle
  never mixes old JavaScript with a newly cleaned cache. The next app open uses
  the new worker and removes outdated precaches without manual cache clearing.
- The typed custom worker at `src/service-worker.ts` is compiled and receives its
  revisioned precache manifest through `vite-plugin-pwa`'s `injectManifest`
strategy. Workbox owns cache revisioning and deletes outdated precaches.

## Browser/device support targets
- Modern evergreen browsers (Chrome, Safari, Edge, Firefox — last 2 versions).
- Primary target form factor: **tablet** (most common device for this age group), secondary: phone, desktop is a bonus not a priority for the child-facing UI (though Parent Zone should work fine anywhere).
- Must support both touch (mobile/tablet) and mouse (desktop) input for drag-and-drop — use Pointer Events (not separate touch/mouse handlers) to unify this in the puzzle engine.

## Testing expectations
- Puzzle engine: unit tests for piece-cutting math and snap-tolerance logic across all 4 tiers.
- Parent gate: test that it cannot be bypassed by rapid tapping, browser back button, or page refresh mid-gate.
- Data layer: test that child-facing flows never write anything requiring network/identity, and that IndexedDB reads/writes degrade gracefully (private/incognito browsing can restrict storage — handle this without crashing).
- PWA: test offline playability after first load (disable network in devtools and verify).
