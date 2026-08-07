# Compliance — Fitzee

This app targets children under 13, which triggers specific legal requirements regardless of platform. **v1 ships as a web app, not through an app store** — this removes app-store review requirements (Apple Kids Category, Google Play Families Policy) for now, but does **not** remove legal requirements like COPPA (US) or GDPR-K/regional equivalents, which apply to any online service directed at children, website or app alike. This doc is a working checklist, not legal advice — have an actual lawyer review before any public/paid launch.

## Parent Gate
Required before any screen that includes: settings changes affecting difficulty/tier, purchase/subscription flows, external links, or data/privacy controls.

**Implementation requirement:** a gate that a child in the 2–10 range is unlikely to pass by accident or by repeated random tapping, but that isn't so hard a parent struggles. Typical accepted patterns:
- Simple age-appropriate math problem (e.g., "What is 7 + 4?") requiring typed numeric input
- Press-and-hold gesture for a sustained duration (e.g., 3 seconds) combined with a instructional text a young child can't yet read
- Do NOT use: simple "Are you a parent? Yes/No" tap buttons (trivially passable by a toddler), swipe gestures alone (too easy to do by accident)

See `docs/NAVIGATION.md` for where the gate sits in the nav tree, and `docs/DATA_MODEL.md#parentzonestate` for session rules (must re-verify every entry, never persists across app restarts or after 60s background).

### v1 parent-gate decision

Fitzee uses the documented typed math pattern: the adult reads and answers
`7 + 4`. The continue action stays disabled until the numeric answer is correct,
so repeated or rapid taps cannot bypass the gate. Verification exists only in
React memory, is cleared whenever Parent Zone is exited, and is invalidated when
the app returns after more than 60 seconds in the background. It is never written
as a valid IndexedDB session.

Parent-only routes are guarded during render as well as redirected after render,
so a direct URL cannot paint Parent Zone content for even one frame before the
gate appears. Local-data deletion keeps the parent on the confirmation screen and
shows an error if IndexedDB cannot confirm that every store was cleared; it never
reports an unverified deletion as successful.

Screen-time reminders offer Off, 15, 30, 45, and 60 minutes. A reminder pauses
the child-facing UI with a neutral “time for a little break” message; dismissing
it starts the selected interval again. This is a reminder only, never a fail state
or forced lockout.

## Data collection checklist
- [x] No child-facing screen collects name, photo, voice, location, or any directly identifying information.
- [x] No persistent device identifiers used for tracking/advertising purposes (advertising ID, IDFA, etc. must not be accessed).
- [x] No analytics is collected in v1; therefore no individual child profile is built.
- [x] No third-party SDK, analytics SDK, ad SDK, crash reporter, or remote font is integrated.
- [x] No Parent Zone data is collected in v1. Any future email/payment collection remains confined to the gated billing module.
- [x] A plain-language parent-facing disclosure is implemented at `parent_privacy`.
- [x] `parent_privacy` provides a confirmed action that deletes settings, progress, rewards, and Parent Zone state from IndexedDB.

## Advertising checklist
- [x] No behavioral/targeted advertising anywhere in the app.
- [x] No ads of any kind are shown in v1.
- [x] No ad SDK exists in the dependency tree or runtime source.

## Monetization checklist
- [x] No purchase entry point exists in the child experience; the deferred subscription route is guarded by `parent_gate`.
- [x] No "nag" screens push purchases to the child during play.
- [x] No randomized/chance-based purchasable content exists.
- [x] Not applicable until Phase 4 is explicitly pursued: no price, purchase, or restore flow exists in v1.
- [x] Not applicable until Phase 4 is explicitly pursued: no subscription or cancellation flow exists in v1.

## Web-specific compliance checklist (v1)
- [x] No cookies or tracking scripts run in the child-facing experience.
- [x] Runtime libraries and system fonts are bundled/self-hosted; no third-party CDN scripts or font requests exist.
- [x] A plain-language privacy policy is available behind `parent_gate` at `parent_privacy`.
- [x] No hosting or application analytics is enabled. Any future analytics requires a new compliance review and disclosure.
- [x] Production is served by GitHub Pages over HTTPS.
- [x] No third-party iframe or widget exists; the v1 Content Security Policy blocks external scripts, connections, frames, objects, and forms by default.

## Future: app store requirements (relevant only if/when native wrapping happens — see `FUTURE_IMPROVEMENTS.md`)
- [x] Deferred/not applicable to web v1: review current Apple Kids Category requirements before any native submission.
- [x] Deferred/not applicable to web v1: review current Google Play Families Policy before any native submission.
- [x] Deferred/not applicable to web v1: app-store developer fees are outside this web roadmap.

## Content review
- [x] Current puzzle imagery is friendly, non-frightening, and age-appropriate across the 2–10 range.
- [x] Current artwork is original and contains no proprietary modern copyrighted characters, real brand logos, or identifiable people. Public-domain classic characters (such as 1928 Steamboat Willie Mickey Mouse and classic fairy-tale characters) are verified public-domain adaptations using custom non-infringing artwork.

## Phase 2 verification record

The Phase 2 code pass verified the runtime dependency manifest and source contain
no analytics, advertising, cookie, identity, upload, beacon, or external-request
integration. Browser checks verified that empty/rapid gate submissions remain
locked, a direct Parent Zone route and page refresh return to the gate, tier
override persists, the policy is readable, and local deletion requires a second
confirmation before returning to onboarding. This engineering checklist is not a
substitute for legal advice or a lawyer's review before commercial launch.

## Process note for AI agents
If a task in `ROADMAP.md` would require violating any checked item above (e.g., "add an ad SDK," "add a login for kids," "add a spin-the-wheel reward"), stop and flag it rather than implementing — these are hard constraints per `AGENTS.md`, not preferences.
