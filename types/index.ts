/**
 * Shared domain types for Findora.
 * Mirrors the data model in docs/PRD.md §8 — refine as the schema evolves.
 */

/** A user can act as a reporter (family) and/or a finder (public). */
export type UserRole = "reporter" | "finder";

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: string;
}

export type CaseStatus = "active" | "resolved";

export interface MissingPersonCase {
  id: string;
  reporterId: string;
  name: string;
  age: number | null;
  description: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  photoUrl: string;
  /** Reporter preference: auto-share contact info with finders on a Strong match. */
  contactShareEnabled: boolean;
  status: CaseStatus;
  createdAt: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export type SightingStatus = "pending" | "matched" | "expired";

export interface Sighting {
  id: string;
  finderId: string;
  photoUrl: string;
  /** Precise sighting location — visible only to the case's reporting family. */
  location: GeoPoint;
  notes: string | null;
  status: SightingStatus;
  createdAt: string;
}

export type MatchTier = "strong" | "notify" | "possible";

export type FamilyAction = "none" | "different_person" | "resolved";

export interface Match {
  id: string;
  caseId: string;
  sightingId: string;
  /** 0–100 similarity confidence from the face-matching engine. */
  confidenceScore: number;
  tier: MatchTier;
  contactShared: boolean;
  familyAction: FamilyAction;
  reviewedAt: string | null;
}
