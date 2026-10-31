# Build Plan: Poros Prototype

Use this as the task list to hand to a coding agent (Claude Code or similar). Each phase is scoped to be completable independently and checkpointed before moving on.

## Phase 0 — Setup
- [x] Init single-page app (Next.js App Router + Tailwind v4 + shadcn `base-nova` on `@base-ui/react`)
- [x] Create `lib/data/` with typed mock data: 1 patient, 1 payer plan, 5 CPT codes (mix of auto-approved and needs-prior-auth), 3 denial reason codes with matching guideline snippets
- [x] Set up app shell at `/demo`: sidebar nav for the 3 flows + a patient timeline/detail view

## Phase 1 — Flow A: Cost Estimate
- [x] Build scheduling screen: pick CPT code for the one patient (`/demo/estimate`)
- [x] Build estimate calculation logic (deductible + coinsurance math against mock plan data, `lib/demo/estimate.ts`)
- [x] Build result display: plain-language estimate + high-risk-of-surprise-bill flag
- [x] Checkpoint: schedule → estimate in under 30 seconds on screen

## Phase 2 — Flow B: Prior Auth Assist
- [x] "Requires prior auth" flag logic tied to specific CPT codes
- [x] Auto-generated prior auth request view (pulls mock clinical note text into the justification field)
- [x] Status tracker UI (draft/submitted/approved/denied) with a deadline countdown
- [x] Checkpoint: flagged procedure auto-generates a request

## Phase 3 — Flow C: Appeal Assist
- [x] "Denial received" trigger (Simulate Denial button, `/demo/prior-auth`)
- [x] Match denial reason code to mock guideline snippet
- [x] Draft appeal letter — templated text with fields filled in (`lib/demo/appeal.ts`)
- [x] Appeal status tracker + deadline display
- [x] Checkpoint: denial → drafted appeal in one flow

## Phase 4 — Connective Narrative
- [x] Patient timeline view (`/demo`) shows history across all three flows (estimate given → prior auth submitted → denied → appeal drafted → won)
- [x] Visual design polish pass — demo app reuses the marketing site's teal/gold/paper/ink brand tokens and Playfair Display + Inter typography via a shadcn/Tailwind token bridge
- [x] Removed placeholder/lorem ipsum — mock data reads as a realistic orthopedic (knee) visit for Maria Torres

## Phase 5 — Deck & Demo Video
- [x] Pitch deck drafted (problem → solution → live demo → competitive positioning table from PRD §8 → ask) — see project artifacts
- [ ] Record 3–5 min demo video walking through the one-patient narrative end to end
- [ ] Compress video if needed to stay under 1GB per submission form requirements
- [ ] Final review against submission form fields (bio, problem statement, upload)

## Phase 6 — Design Unification, Motion, and Real Auth
- [x] Unified the design system across the marketing site and `/demo`: one shared radius/border/typography vocabulary via `components/ui/{button,card}.tsx` and a `--radius-*` token in `app/globals.css`
- [x] Sticky, opaque header on both the marketing site and `/demo`; theme toggle moved inline (no more floating fixed circle)
- [x] Framer Motion scroll-reveal on marketing sections, mount transitions on demo result cards and route changes, `prefers-reduced-motion` respected throughout
- [x] Three.js hero accent (`@react-three/fiber` + `drei`, client-only, dynamically imported) with a static gradient fallback
- [x] Real hero background photo + zigzag alternating-image layout for the Platform and Practice marketing sections (7 sourced, license-checked photos)
- [x] Charts: a marketing stat chart (13 hrs/week, honestly framed against a 40-hour reference) and a cost-breakdown chart on `/demo/estimate`, both via Recharts and re-coloring correctly with the theme toggle
- [x] Google Sign-In gate (Firebase Auth) in front of `/demo`, with a graceful "Firebase not connected yet" state and a preview escape hatch so the demo stays clickable before real credentials are configured
- [x] Pitch deck refreshed to match: sharper card radii, a div-based version of the stat chart, a real cover photo, and two screenshots from the redesigned app

## Notes for the agent
- Front-end-only prototype. No real backend, no real integrations, per PRD §4.
- The demo narrative (Phase 4) matters more than feature count — the `/demo` timeline is the single most important screen, since it's the one that proves "one data model, three friction points."
- Theme toggle uses the View Transitions API for a real-time circular reveal (see [`lib/theme/use-theme-toggle.ts`](lib/theme/use-theme-toggle.ts)) with a plain instant-swap fallback for browsers without support or `prefers-reduced-motion`.
