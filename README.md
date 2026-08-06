# Fitzee

Fitzee is a local-first jigsaw puzzle PWA for children ages 2–10. It has four
age tiers, deterministic rewards, English and Filipino UI, seasonal content,
and no backend, child accounts, advertising, or analytics.

## Run locally

Requires Node.js 24 and npm.

```bash
npm install
npm run dev
```

The development server prints its local URL. All progress and settings stay in
the current browser's IndexedDB storage.

## Validate a release

```bash
npm run lint
npm test
npm run build
```

`npm run build` creates the installable offline PWA in `dist/`. To exercise the
production service worker locally, run `npm run preview` after building.

## Project guide

- [ROADMAP.md](ROADMAP.md) is the build-order source of truth.
- [docs/PRD.md](docs/PRD.md) defines the audience and product principles.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) describes the implementation.
- [docs/COMPLIANCE.md](docs/COMPLIANCE.md) records privacy and parent-gate rules.
- [AGENTS.md](AGENTS.md) contains non-negotiable contributor constraints.

Production is designed for GitHub Pages at
<https://jempaynation.github.io/Fitzee/>. CI and Pages workflows live in
`.github/workflows/`.

## Release scope

Phases 0–3 and 5 are implemented for v1.0.0. Phase 4 monetization is optional
and remains intentionally deferred until the product owner chooses a business
model. No payment or purchase path is present in the current app.
