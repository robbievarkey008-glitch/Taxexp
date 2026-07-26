/**
 * TypeScript types for Firestore document schemas.
 *
 * These mirror the data model in Section 3 of the spec exactly.
 * Firestore Timestamps are stored as ISO strings in the app layer
 * and converted to/from Firestore Timestamps in the read/write helpers.
 */
import type { Timestamp } from "firebase-admin/firestore";

// ── Certificate document ─────────────────────────────────────────────────────

export type CertificateStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
export type BuyerType = "customer" | "company_location";

export interface CertificateDoc {
  shop: string;
  buyerType: BuyerType;
  shopifyCustomerId: string;              // gid://shopify/Customer/...
  shopifyCompanyLocationId: string | null; // gid://shopify/CompanyLocation/... or null
  customerEmail: string;
  customerName: string;
  jurisdiction: string;                  // human-readable, e.g. "California — Reseller"
  taxExemptionCode: string;              // valid TaxExemption enum value
  exemptionNumber: string;               // resale license / state tax ID
  fileStoragePath: string;               // Firebase Storage path (not a public URL)
  status: CertificateStatus;
  rejectionReason: string | null;
  expirationDate: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firestore document ID is auto-generated; this type includes it
export interface Certificate extends CertificateDoc {
  id: string;
}

// ── ShopSettings document ────────────────────────────────────────────────────

export interface ShopSettingsDoc {
  shop: string;
  planIsPlus: boolean;                   // detected at install, cached
  onboardingCompleted: boolean;          // true once the merchant finishes initial setup
  usesThirdPartyTaxService: boolean;     // merchant self-reports on onboarding
  thirdPartyTaxServiceName: string | null;
  geminiExtractionEnabled: boolean;      // defaults false — opt-in only
}

// Document ID is shop domain
export interface ShopSettings extends ShopSettingsDoc {
  id: string; // === shop domain
}

// ── Helper: safe conversion from Firestore doc data ──────────────────────────

export function toCertificate(
  id: string,
  data: FirebaseFirestore.DocumentData
): Certificate {
  return { id, ...(data as CertificateDoc) };
}

export function toShopSettings(
  id: string,
  data: FirebaseFirestore.DocumentData
): ShopSettings {
  return { id, ...(data as ShopSettingsDoc) };
}
