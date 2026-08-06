# Future Improvements — Fitzee

Ideas beyond v1 scope. Nothing here should be implemented unless explicitly promoted into `ROADMAP.md` first — this file is a backlog/idea log, not a task list. Organized roughly by effort and by theme.

## Platform expansion
- **Native app wrapping (low effort once web app is solid):** wrap the existing web app with [Capacitor](https://capacitorjs.com/) to produce iOS/Android builds from the same codebase, then submit to app stores once budget allows ($99/yr Apple, $25 one-time Google). This reuses ~100% of the web code — no rewrite needed.
- **True native rewrite (high effort):** if native-only APIs become important (deeper haptics, offline app-store discoverability, better OS-level parental controls integration), consider a Flutter or React Native rewrite using this same doc set as the spec — most of `docs/PRD.md`, `docs/CONTENT_SPEC.md`, `docs/PUZZLE_ENGINE.md`, and `docs/DATA_MODEL.md` would carry over largely unchanged; only `docs/ARCHITECTURE.md` would need a new stack section.
- **Desktop app:** Electron/Tauri wrapper for a downloadable desktop version, useful for classroom/school computer labs without app store access.
- **Smart TV / large screen mode:** simplified remote-control or touch-TV interaction mode — some households use tablets docked to TVs for young kids.

## Content & educational depth
- **More categories:** Space & Science, Music & Instruments, World Cultures & Flags, Sports, Emotions & Feelings (social-emotional learning angle).
- **Difficulty auto-tuning:** track completion time/attempts per puzzle and quietly suggest tier adjustments to parents rather than forcing a static tier ("Looks like [current tier] puzzles are going fast — want to try harder ones?").
- **Printable mode:** generate a PDF of a puzzle for offline/printed play — nice low-screen-time option, easy win since content is already vector/image-based.
- **Narrated storytelling puzzles:** completing a themed puzzle set unlocks a short narrated story related to the theme (e.g., complete all "Farm" puzzles → unlock a 2-minute farm story).
- **Multi-language expansion:** the no-read UI design already lends itself to easy localization — add narration + UI strings for additional languages as a relatively low-effort, high-reach improvement.

## Engagement & retention
- **Daily puzzle / puzzle of the day:** a rotating featured puzzle to build a return habit, still with no punishing "streak breaks" framing for young kids.
- **Printable certificate / milestone moments:** e.g., "50 puzzles completed!" printable award for parents to display — physical-world tie-in that many parents of this age group value.
- **Classroom/teacher mode:** a simplified multi-child rotation on a single shared device (e.g., tap an avatar to switch active child profile without full account creation) — useful for preschools/daycares, still local-only and privacy-safe.
- **Sibling profiles:** lightweight local profile switching (name + avatar, no login) so siblings sharing one device/tablet each get their own progress and tier, without needing accounts or cloud sync.

## Parent-facing features
- **Progress dashboard:** simple visual summary in Parent Zone of puzzles completed, time spent, favorite categories — framed supportively, not as a report card.
- **Screen-time insights:** optional, local-only session-length tracking with gentle reminders (already scoped as a toggle in v1 — this extends it into a fuller picture).
- **Export/backup progress:** since v1 storage is browser-local (`docs/DATA_MODEL.md`), losing browser data loses progress. A "download my child's progress as a file" / "restore from file" feature in Parent Zone would mitigate this without requiring a full account/cloud system.

## Technical improvements
- **Optional cloud sync (opt-in, parent-gated):** for the export/backup problem above, a lightweight opt-in sync (e.g., parent enters an email, gets a magic-link-style code) so progress follows a child across devices — must stay fully optional and clearly disclosed, and would need a real backend + updated `docs/COMPLIANCE.md` review before building.
- **Accessibility certification pass:** formal WCAG 2.1 AA audit once core product is stable, beyond the informal accessibility notes already in `docs/UI_UX_GUIDELINES.md` and `docs/PUZZLE_ENGINE.md`.
- **Automated puzzle-image pipeline:** tooling to batch-validate new puzzle images against `docs/CONTENT_SPEC.md` requirements (resolution, no embedded text, contrast) before they're added, to keep content-adding fast as the library grows.
- **A/B testing framework (privacy-safe):** for tuning things like snap tolerance or reward pacing — must be built without any behavioral tracking of individual children (aggregate, anonymous experiment buckets only).

## Monetization ideas (beyond the basic Phase 4 plan)
- **One-time "family pack" purchase** instead of subscription — often preferred by parents for kids' apps over recurring billing.
- **Physical product tie-in:** printable/mail-order physical puzzle version of a favorite digital puzzle — novel but higher-effort, revisit only if there's real demand signal.
- **Ad-free guarantee as a selling point** rather than running any ads at all — given the compliance complexity of child-directed advertising (`docs/COMPLIANCE.md`), staying ad-free entirely may be simpler and more marketable than trying to run compliant ads.

## Explicitly deprioritized (revisit only with strong justification)
- Any social/multiplayer feature involving child-to-child interaction — safeguarding complexity is high relative to value for this age group.
- User-uploaded photo puzzles — real-world photo moderation for a children's product is a significant safety/legal burden; would need a dedicated moderation plan before even prototyping.
- In-app currency or any gamified spending mechanic aimed at children — conflicts with the project's existing hard constraint against manipulative reward mechanics (`AGENTS.md`).
