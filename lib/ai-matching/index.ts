/**
 * Face-matching engine for Findora.
 *
 * Planned pipeline (docs/PRD.md §3.3, §4):
 * - Face detection + embedding generation for case and sighting photos (face-api.js).
 * - Cosine similarity comparison of a new sighting against all active cases.
 * - Confidence tiers: strong (>= 85%), notify (70–84%), possible (40–69%), discarded (< 40%).
 *
 * To be implemented in an upcoming step.
 */
export {};
