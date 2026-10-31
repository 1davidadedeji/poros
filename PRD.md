# PRD: Poros

**Owner:** David Adedeji
**Status:** Draft for hackathon build (Break the Barrier, Inventacare, due Nov 1 2026)
**Format:** Interactive prototype + pitch deck/video (not production software)

---

## 1. Problem Statement

Small and independent medical practices (1–5 providers) face the same insurance-related administrative burdens as large hospital systems — cost opacity, prior authorization, claim denials — but cannot afford or integrate the enterprise tools (Cedar, Waystar, Cohere Health, Optum) that solve these problems at the hospital-system level. This leaves front-desk staff at small practices doing manually what large systems already automate, contributing to patient cost surprises, care delays from denied/unsubmitted prior auths, and staff burnout.

## 2. Target User

- **Primary:** Front-desk / office manager at a 1–5 provider independent practice (family medicine, specialty clinic)
- **Secondary:** The physician/provider at that practice, who currently absorbs overflow admin work
- **Tertiary (beneficiary, not direct user):** The patient, who experiences fewer cost surprises and fewer denied-then-delayed treatments

## 3. Goals for This Submission

1. Demonstrate a coherent, single-data-model product across three friction points (not three disconnected features)
2. Make the workflow obviously usable by non-technical front-desk staff — no jargon, minimal clicks
3. Be honest about what's real vs. simulated (judges are healthcare-savvy; don't overclaim integrations we don't have)

## 4. Scope: What's In / Out for the Prototype

**In scope (built):**
- A single mock patient walked through all three flows below
- Realistic-looking UI for a front desk / practice manager
- Mock data for: patient, insurance plan, CPT/procedure codes, payer denial reason codes, clinical note snippets
- A simple rules-based "engine" that reacts to the mock data (e.g., certain CPT codes trigger a "needs prior auth" flag; certain payers have certain deductible remaining) — hardcoded/scripted, not real ML
- Clean visual design suitable for screen recording

**Out of scope (not built for real):**
- Real EHR integration (Epic, athenahealth, etc.)
- Real payer/insurance API connections (eligibility verification, claims submission)
- Real AI/LLM calls — the appeal letter and prior auth request are templated from mock data, not model-generated
- User accounts, authentication, multi-practice support
- HIPAA compliance infrastructure (mentioned as a "next steps" line in the deck, not built)

## 5. Core Flows

### Flow A — Cost Estimate (at scheduling)
1. Front desk selects patient + procedure/CPT code being scheduled
2. System shows: patient's plan type, deductible remaining (mock), estimated allowed amount for that code, estimated patient responsibility
3. Output: a plain-language line the staff can read aloud — "Based on your plan, you'll likely owe around $X for this visit."
4. Flags if the scenario looks high-risk for a surprise bill (e.g., out-of-network, non-covered code)

### Flow B — Prior Auth Assist
1. Triggered when the scheduled procedure is flagged as requiring prior authorization
2. System pulls mock clinical note fields relevant to medical necessity
3. Auto-generates a structured prior auth request (payer, code, clinical justification pulled from note)
4. Shows submission status + a countdown/deadline tracker (mock)

### Flow C — Appeal Assist
1. Triggered by a mock "denial received" event with a denial reason code
2. System matches the denial reason against a small mock library of payer policy/clinical guideline snippets
3. Auto-drafts an appeal letter citing the relevant guideline, tailored to the specific denial reason
4. Shows the appeal deadline and a tracked status (Draft → Submitted → Outcome)

### Connective thread
All three flows pull from the **same patient record** (visible in a simple patient detail/timeline view) so the demo shows: schedule → get estimate → treatment needs prior auth → submitted → denied → appeal drafted → resolved, as one continuous story for one patient.

## 6. Data Model (mock, for the prototype)

```
Patient
  - name, DOB (mock)
  - insurance plan (payer name, plan type, deductible total, deductible met)

Visit
  - patient_id
  - CPT/procedure code
  - provider notes (clinical justification text)
  - requires_prior_auth (bool, derived from code)

PriorAuth
  - visit_id
  - status (draft/submitted/approved/denied)
  - deadline

Denial
  - visit_id or priorauth_id
  - denial_reason_code
  - deadline_to_appeal

Appeal
  - denial_id
  - status (draft/submitted/won/lost)
  - letter_text
```

Implemented as typed TypeScript in [`lib/data/types.ts`](lib/data/types.ts), with the mutable per-session state (`PriorAuth`, `Denial`, `Appeal`, and the timeline log) held in [`lib/demo/context.tsx`](lib/demo/context.tsx).

## 7. Success Metrics (for the pitch, framed honestly as *projected*, not measured)

- Time saved per prior auth / appeal (estimate based on published AMA physician survey data — ~13 hrs/week per physician currently spent on prior auth)
- Reduction in patient cost-surprise incidents (qualitative claim, not a fabricated number)
- Adoption feasibility: no EHR integration required to start (differentiator vs. Cedar/Waystar)

## 8. Competitive Positioning (for the deck, not the app)

| | Cedar/Waystar | Cohere/Optum | Counterforce/Claimable | **Poros** |
|---|---|---|---|---|
| Cost estimation | ✅ | – | – | ✅ |
| Prior auth | – | ✅ | – | ✅ |
| Appeals | – | – | ✅ | ✅ |
| Built for small/solo practices | ❌ | ❌ | Partial (patient-facing) | ✅ |
| Requires EHR/enterprise integration | Yes | Yes | No | No |

## 9. Open Questions / Risks

- Letter/request drafting is fully templated from mock data (not a real LLM call) — the fastest, most reliable path to a legible "AI" moment for judges without adding an external dependency to the demo.
- Judges evaluate "concept and the individual(s) behind it, not production quality" per the submission form — so prioritize clarity of the idea and demo narrative over engineering polish.
