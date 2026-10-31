# Poros

A practice workflow application with an interactive patient demo.

## Run locally

```sh
pnpm install
pnpm dev
```

- `/`: responsive marketing site with generated clinic photography, alternating feature layouts, an interactive estimate and deductible comparison graph.
- `/workspace`: create and edit tasks, assign workflows and due dates, update status, search, filter by status or overdue date, delete with confirmation, and export the visible worklist as CSV. Includes an estimate calculator with downloadable results and saved follow-up tasks, plus a live chart of open/completed tasks by workflow.
- `/sign-in`: Google and email/password sign-in, registration, password reset, and email verification.
- `/api/support`: server-only OpenAI Responses API endpoint used by the support panel throughout the site.
- `/api/draft`: server-only OpenAI Responses API endpoint that drafts the sample appeal letter from the editable clinical note (see [AI boundary](#ai-boundary)).
- `/demo`: public sample patient timeline, cost estimates, prior authorization and appeal walkthroughs. Payer submissions and decisions are simulated.

Without Firebase, workspace tasks persist in this browser's local storage. Signed-in users have a separate personal Firestore workspace; local records are never silently uploaded. The workspace stores administrative task references, not patient records. Use non-sensitive references. This is not a production clinical record system or a connected payer/EHR service.

## Firebase setup

1. Create a Firebase project and register a web app.
2. Copy `.env.local.example` to `.env.local` and fill in the web app configuration. Never commit private service-account credentials.
3. Enable **Authentication → Google**, and add localhost and your deployed domain to authorized domains.
4. Create a Firestore database. Publish the rules in `firestore.rules` before using cloud storage. With the Firebase CLI authenticated, run `firebase deploy --only firestore:rules --project YOUR_PROJECT_ID`.
5. Restart the development server (or rebuild your deployment). `/sign-in` offers Google, email/password, registration, and recovery. Enable Email/Password as well as Google in the Firebase console.
6. Verify with two accounts that each can only access its own `/users/{uid}/tasks` collection.

Rules limit task access to the authenticated owner and validate the document shape. There is no team sharing yet. Authentication and Firestore failures appear in the interface without falsely reporting success. Google’s interactive consent requires the account owner. Run `pnpm verify:firebase` to check live email/password auth, task persistence, and owner isolation; it creates two disposable accounts and a non-sensitive test task, then removes them. The script returns a failing exit code if public/cross-account reads are allowed.

References: [Firebase Google sign-in](https://firebase.google.com/docs/auth/web/google-signin), [Firestore access rules](https://firebase.google.com/docs/firestore/security/rules-conditions).

## Estimates and demo boundaries

The planning calculator uses an allowed amount, remaining deductible, and coinsurance supplied by the user. It does not verify benefits, apply copays or out-of-pocket limits, or guarantee coverage. The sample demo uses a fictional patient and payer. No payer submission, EHR connection, clinical validation, or HIPAA-ready infrastructure is implemented.

## AI boundary

OpenAI is used in exactly two places: the support chat (`/api/support`) and the appeal draft (`/api/draft`). Cost estimates, the prior-auth flag, the prior-auth request, denial matching, and every payer decision are deterministic code or simulated.

**What the appeal draft sends.** The editable sample clinical note (shown on `/demo/prior-auth` and `/demo/appeal`, up to 4,000 characters), the denial code, and the matched guideline text. The server looks up the guideline from `lib/data/mock-denials.ts` by code; the client cannot supply guideline text. Fixed sample header details (patient name, DOB, payer, procedure) are included for the letter header only. Don't enter real patient information: this demo is not built for PHI.

**What it returns.** Structured output (`json_schema`, strict) with `extracted_facts[]`, `criteria_met[]` (each with a supporting quote from the note), `criteria_not_supported[]` (each with a reason), and `letter_text`. The instructions limit the model to facts in the note and criteria in the supplied guideline, and tell it to list unsupported criteria instead of asserting them.

**What is enforced in code, and what isn't.** The server checks each `criteria_met` quote against the note. A criterion whose quote doesn't appear word for word (ignoring case, whitespace and quote style; no ellipses; at least 12 characters) is moved to *Not supported* and flagged in the UI. Malformed or incomplete output is rejected. The server does **not** verify the letter prose or the extracted facts. The model can still misstate something, so the UI shows the facts, quotes and gaps beside an editable letter. Staff must tick a review confirmation and approve the letter before **Submit Appeal** is enabled. If the note changes after drafting, approval is blocked until the letter is redrafted.

**Fallback.** If no key is set or the call fails, times out, is rate-limited or returns invalid output, the original template in `lib/demo/appeal.ts` is used and labelled *Template draft*. The template's clinical paragraph is fixed sample wording that does not read the note, and the UI says so.

**Guideline library.** The payer (Meridian Health Alliance) and its policies are fictional, written for this demo, and labelled "Illustrative, not real payer policy" wherever they appear.

Both routes share the same guards in `lib/server/openai.ts`: same-origin check, JSON content type, a byte-bounded body reader (20 KB for support, 12 KB for drafting), `store: false`, provider-status-only logging, and **one shared per-process budget** (15 requests per client per hour, 120 globally, counted across chat and drafting together). Drafting uses `OPENAI_DRAFT_MODEL`, then `OPENAI_SUPPORT_MODEL`, then `gpt-4.1-mini`, with a 25-second timeout and 1,800 output tokens.

## Design and assets

Shared teal/neutral tokens, square buttons/cards/inputs, focus states, and an integrated theme control apply throughout. Marketing, demo, and workspace share the same fixed navigation; demo patient information and workflow navigation remain visible below it. Headers remain visible during scrolling. Marketing motion respects reduced-motion settings; the homepage avoids loading a WebGL canvas for decoration.

The generated hero is `public/images/clinic-hero.webp` (69 KB); source PNG is retained beside it. Generated with the built-in imagegen tool. Prompt: “Editorial photograph of an airy independent medical clinic reception, soft sage green walls, pale oak desk, soft daylight through tall windows, a female clinician in muted teal scrubs on the right warmly talking to an adult patient seen from behind. Natural candid moment, authentic unposed healthcare, sophisticated architectural photography, realistic skin and materials. Wide landscape composition with the left half primarily softly lit blank sage wall and subtle window shadows, useful negative space for headline overlay. No text, logos, watermarks, charts, or medical equipment closeups. Calm, welcoming, crisp but softly lit.”

Video generation was unavailable; no video asset is included.

## Verification

```sh
pnpm test
pnpm exec tsc --noEmit
pnpm build
```

## Added practice photography

Asset: `public/images/practice-team.webp` (web-optimized); original: `public/images/practice-team.png`. Generated with the built-in imagegen tool. Prompt:

> Use case: photorealistic-natural. Asset type: healthcare practice website editorial photograph. Create a premium natural documentary photograph of two female healthcare practice colleagues, one Black clinician in muted sage scrubs and one older office manager in cream blouse, reviewing a laptop together at an uncluttered reception desk of a small independent medical clinic. Candid focused warm expressions, not looking at camera. Sunlight from large windows, pale sage walls, oak details, quiet refined environment, subtle film texture, realistic hands and anatomy, no visible patient records, no text or logos, no watermark. Wide landscape composition, people in center-right with architectural breathing room. This complements an existing sage-green editorial healthcare website.

The homepage uses photography with a brief entrance animation and reduced-motion support. Interactive charts remain native UI rather than video, so their figures respond to user inputs. No generated video was added; a video-generation tool was not available.

### Verification of this update

- Production build and TypeScript check passed.
- Browser checks passed task creation, editing, reload persistence, overdue filtering, completion, estimate follow-ups, and CSV export.
- Complete sample estimate → authorization → denial → appeal workflow passed.
- All six routes were checked at 390px; populated demo routes and workspace also passed overflow checks at 320px, 768px, and 1024px.
- Dark mode, reduced motion, and fixed-header positions were checked; no browser runtime errors were observed.
- Task validation and CSV escaping passed eight assertions. Firebase live authentication/storage still requires project configuration.

## AI product support

The “Ask Poros” panel is available on the landing page, workspace, sign-in, and demo. It is separate from appeal drafting (see [AI boundary](#ai-boundary)). It answers product questions from the maintained facts in `lib/support/knowledge.ts`. It does not read or modify task records, send tickets, or provide patient-specific advice. Only the typed conversation and current route are sent to the server; messages remain in browser memory and can be cleared with New chat.

Configure `OPENAI_API_KEY` (the existing name `OPEN_AI_API_KEY` also works) and optionally `OPENAI_SUPPORT_MODEL` and `OPENAI_DRAFT_MODEL`, default `gpt-4.1-mini`. The same key powers both support and appeal drafting. Keep this key server-only; never prefix it with `NEXT_PUBLIC_`. All `.env` files are ignored apart from the example. Restart/rebuild after configuration changes.

The route uses the [OpenAI Responses API](https://developers.openai.com/api/docs/guides/text) with `store: false`, a 20-second timeout, a 450-token answer limit, bounded/validated conversation history, same-origin requests, and a 20 KB request-body cap. It logs provider status codes only, not prompts or keys. `store: false` does not promise zero provider retention. The UI identifies the assistant as AI and explains that messages are sent to OpenAI.

Usage protection is per process and shared with appeal drafting: 15 requests per client per hour, with a 120-request global hourly ceiling. Multi-instance production deployments need a shared gateway/edge rate limit and an OpenAI project budget; the in-memory limits reset on server restart and are not a distributed quota. Forwarded IPs are meaningful only behind a trusted proxy. The global ceiling applies regardless of forwarded IP.

Firebase auth follows the [password authentication](https://firebase.google.com/docs/auth/web/password-auth) and [account management](https://firebase.google.com/docs/auth/web/manage-users) APIs. Registration honors the configured password policy. Password-reset responses avoid confirming whether an address exists. Verification and reset emails use Firebase’s hosted action handlers and templates.

The theme wipe lasts 1.1 seconds, ignores repeated clicks until the transition finishes, and remains immediate for reduced-motion users.

### Authentication and support verification

Live checks passed OpenAI connectivity, Firebase email/password registration and sign-in, UI task create/reload/delete, sign-out, Google account-selector launch/cancellation, mobile chat, chat retry, and API payload/origin rejection. All disposable accounts and test tasks were removed. Browser checks found no runtime errors. Unit tests, TypeScript, and production builds pass; the OpenAI secret is absent from the client bundle.

The first live Firestore isolation check failed: public and cross-account reads were allowed by the console’s current rules. **Publish `firestore.rules` in Firestore Database → Rules and run `pnpm verify:firebase` before using cloud storage for real work.** Web app configuration keys cannot publish security rules; this requires administrator console/CLI access. Password-reset and verification email delivery were not tested by sending mail; those use Firebase’s configured templates.
