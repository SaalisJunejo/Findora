# Findora — Product Requirements Document (MVP)

## 1. Overview

**Findora** is an AI-driven web application that helps reunite missing persons with their families. Families create a case for a missing loved one with a photo and details. Members of the public who believe they've spotted someone can submit a sighting with a photo. Findora's face-matching engine compares sighting photos against active missing-person cases and, when a strong match is found, connects the finder and family directly — similar in spirit to how a missing-person flyer with a contact number works today, but automated and AI-assisted.

Case photos are **never publicly browsable** — there is no public "missing persons feed." A case photo is only ever used internally by the matching engine and only surfaces to a finder as part of an actual match result.

This document defines the MVP scope only. Items explicitly excluded from MVP are listed in Section 10.

---

## 2. Users & Roles

Two roles, both requiring an account:

### 2.1 Reporter (Family)
- Creates a missing-person case (photo + details).
- Chooses whether to make their **contact info** visible to finders on a strong match (yes/no setting).
- Receives notifications for high-confidence ("Strong") matches.
- Can view a secondary list of medium-confidence ("Possible") matches in their dashboard.

### 2.2 Finder (Public)
- Requires an account (see Section 2.3 for signup/login flow).
- Submits a sighting: mandatory photo + precise location + optional notes.
- Sees only a match-strength label ("Possible Match" / "Strong Match") — never a raw confidence percentage.
- If a sighting is classified as a **Strong Match** (≥ auto-share threshold) **and** the family has enabled contact-sharing, the finder automatically receives the family's contact info — no manual family confirmation step required.

**Not in MVP:** Verified Organization role (NGO/police) with a moderation dashboard — noted as roadmap (see Section 10).

### 2.3 Account Model (applies to both roles)
- **Sign up:** provide email or phone → verify once via OTP → set a password.
- **All subsequent logins:** email/phone + password (no repeated OTP).
- Kept intentionally lightweight — this is a low-friction account, not a heavyweight registration process.

---

## 3. Core User Flows

### 3.1 Report a Missing Person
1. Reporter (logged in) fills out a case form: name, age, physical description, last-seen location/date, and a photo.
2. Reporter sets a contact-sharing preference: **"Share my contact info automatically on a strong match?"** — Yes/No.
3. Case is saved and becomes an active case, included in face-matching comparisons. The photo is never publicly listed or browsable.

### 3.2 Report a Sighting
1. Finder logs in (or signs up if new — email/phone + OTP once, then password).
2. Finder uploads a **required** photo of the person they believe they saw (no text-only sighting reports allowed).
3. Finder sets the **precise** location where the person was seen (no fuzzing — Findora is not designed for cases involving people who left voluntarily/at risk from being located, so precision is prioritized for usefulness).
4. Finder may add optional notes (e.g., clothing, approximate time seen).
5. Sighting is submitted; the face-matching pipeline runs automatically against all active cases.
6. Sighting location is visible **only** to the reporting family for that specific case — never to other finders or the public.

### 3.3 AI Matching & Confidence Tiers

| Tier | Confidence | Behavior |
|---|---|---|
| **Strong** | ≥ 85% | Family is notified immediately. If the family has enabled contact-sharing, the finder **automatically** receives the family's contact info at this point — no manual confirmation step. |
| **Notify-only** | 70%–84% | Family is notified, but contact info is **not** auto-shared at this tier even if enabled — family can choose to manually share if they want (see 3.4). |
| **Possible** | 40%–69% | Not pushed as a notification. Listed quietly in the family's dashboard under "Other possible matches (unconfirmed)." |
| **Discarded** | < 40% | Not shown to anyone, not stored as a visible match. |

*(These exact thresholds are a starting point — expect to tune them during Day 3–5 testing against your synthetic dataset. The key design point to preserve is: automatic contact-sharing only happens at a meaningfully higher bar than simple notification, to reduce the impact of AI false positives.)*

### 3.4 Match Review & Resolution
1. For **Strong** matches (≥85%) with contact-sharing enabled: contact info is shared automatically and immediately — no family action required to trigger the share.
2. For **Notify-only** and **Possible** tier matches: the family sees the sighting photo, the match label (+ actual confidence %, shown to family only, never to finders), and can optionally choose to manually share contact info with that specific finder if they believe it's a real lead.
3. Family can mark any specific sighting as **"different person"** (a routine rejection — this does *not* penalize the finder, since a wrong AI match is the AI's error, not the finder's)
4. When a family independently confirms (through contact made outside the app, or by marking a case resolved) that the person has been found, the case status changes to **Resolved** and is removed from active matching. This event is recorded (privately) for the anonymized aggregate counter on the landing page.

### 3.5 Post-Resolution
- Resolved cases are archived and are not publicly listed (there is no public listing at any stage, per Section 1).
- The landing page shows only an **anonymized aggregate counter** (e.g., "X people reunited") — no names, no photos, no story details.

---

## 4. AI Scope (MVP)

**In scope:**
- Face detection + face embedding generation for every uploaded photo (case photos and sighting photos).
- Face matching via similarity comparison (e.g., cosine similarity between embeddings) of a new sighting photo against all active case embeddings.
- Confidence-tiered output as defined in Section 3.3.

**Explicitly out of scope for MVP** (list as roadmap in your pitch, do not build or fake):
- OCR (e.g., scanning ID cards or flyers to auto-fill case details)
- Natural-language search
- Age progression / appearance-over-time modeling
- Any AI beyond face matching

---

## 5. Trust & Anti-Abuse Mechanism

- **Identity gate:** every account (finder and reporter) is created via email/phone + one-time OTP verification at signup, then password-based login thereafter. This keeps every sighting traceable to a real, verified contact — without requiring OTP on every single login.
- **Photo requirement:** no sighting can be submitted without an accompanying photo.
- **No penalty for routine mismatches:** a sighting that produces no match, or that a family marks as "different person," is **never** treated as a strike against the finder — this is expected AI/matching error, not user misconduct.
- **No volume-based rate limiting** — genuine, active volunteers should never be penalized for submitting many sightings.

---

## 6. Privacy & Safety Rules

- **No public case browsing at all.** There is no missing-persons feed, public search, or public listing of any case. Case photos are used purely as internal matching inputs.
- **Contact-sharing is reporter-controlled and binary:** family sets one preference — automatically share contact info on a Strong Match (yes/no). This mirrors real-world flyer practice (name + contact info displayed to help find the person), applied to Findora's matching flow.
- **Sighting location is precise, and visible only to the relevant reporting family** — never shown to other finders, never public. Findora's MVP is not designed to protect individuals who left voluntarily/are avoiding being found; that use case is out of scope.
- **Data retention:** sighting photos that produce no strong/notify-tier match are automatically deleted after 30 days.
- **No public success stories:** resolved cases are never displayed publicly with names or photos — only reflected in an anonymized aggregate counter.
- **Biometric data handling:** face embeddings and photos are treated as sensitive data throughout the stack — access-controlled at the database level (not just UI-level), and deleted per the retention policy above.

---

## 7. Screens (MVP)

1. **Landing page** — brief app explanation, anonymized "X reunited" counter, entry points to sign up / log in, "Report Missing Person," and "Report a Sighting."
2. **Sign up / Log in** — email or phone + OTP (signup only) → set password; email/phone + password (all logins thereafter).
3. **Report Missing Person form** — name, age, description, last-seen info, photo upload, contact-sharing preference toggle.
4. **Report a Sighting flow** — photo upload → precise location picker (map) → optional notes → submit confirmation.
5. **Family dashboard** — list of the reporter's own case(s), status per case, Strong/Notify match alerts, "other possible matches" secondary list, manual share/flag-fake actions per sighting.
6. **Match detail screen** — sighting photo, match label (+ % for family), and available actions (share contact / mark different person / flag fake / resolve case).
7. **Contact-shared confirmation screen (finder side)** — shown to a finder when a Strong Match auto-releases the family's contact info.

*(No public search/browse screen — removed, since there is no public case visibility in this design.)*

---

## 8. Data Model (starting point for schema design)

Suggested core entities — refine during Day 1 schema design:

- **users**: id, email/phone, password_hash, role (reporter/finder — a user could technically be both), created_at
- **cases**: id, reporter_id, name, age, description, last_seen_location, last_seen_date, photo_url, contact_share_enabled (bool), status (active/resolved), created_at
- **sightings**: id, finder_id, photo_url, location (lat/lng, precise), notes, created_at, status (pending/matched/expired)
- **matches**: id, case_id, sighting_id, confidence_score, tier (strong/notify/possible), contact_shared (bool), family_action (none/different_person/resolved), reviewed_at

Row-level security should enforce: case photos are never queryable by any client except the matching engine and, post-match, the relevant finder as part of a match result. Family contact info is only exposed to a finder when `matches.contact_shared = true`.

---

## 9. Technical Approach

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js (React) + Tailwind CSS, deployed on Vercel | Fast to build, free hosting, responsive by default |
| Backend / DB / Auth / Storage | Supabase (PostgreSQL, storage, auth, row-level security) | One platform covers database, file storage, and auth (OTP at signup + password login); free tier; RLS enforces privacy rules at the data layer |
| Face Matching | face-api.js (open-source, self-hosted in own backend) | No external API keys/accounts needed, no usage caps, fully free, self-contained — reduces risk during judging |
| Matching Logic | Cosine similarity between face embeddings, tiered thresholds per Section 3.3 | Simple, explainable, tunable |
| Notifications | Email via Resend or Supabase's built-in email | Free, sufficient for MVP; SMS explicitly avoided due to cost |
| Maps | Leaflet.js + OpenStreetMap | Free, no API key required |

**AI scope reminder for the build tool:** implement face detection + embedding + cosine similarity matching only. Do not build OCR, NLP search, or age progression — these are out of scope.

---

## 10. Explicitly Out of Scope for MVP

- Verified Organization accounts / moderation dashboard
- Public case browsing / missing-persons feed / public search
- OCR (flyer/ID scanning)
- Natural-language search
- Age progression modeling
- SMS notifications
- Public success-story feed with names/photos
- Location fuzzing/precision choice (location is always precise in this design)

---

## 11. Demo Data

All demo/test data must be **synthetic sample profiles created by the team** — not real missing-person cases or scraped real-world data. This keeps the demo safe, repeatable, and ethically clean for a hackathon presentation.

---

## 12. Success Criteria for MVP Demo

- A reporter can sign up, log in, and create a case with a photo and a contact-sharing preference.
- A finder can sign up, log in, and submit a sighting (photo required, precise location).
- The system correctly runs face matching and classifies results into the four tiers (Strong / Notify / Possible / Discarded).
- A Strong Match with contact-sharing enabled automatically releases the family's contact info to the finder, with no manual step.
- A Notify or Possible tier match is visible to the family, who can manually share contact info or mark it as different person.
- The landing page reflects an anonymized reunification counter after a successful demo resolution.
