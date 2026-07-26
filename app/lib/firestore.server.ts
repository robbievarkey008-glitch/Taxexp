/**
 * Firestore read/write helpers for certificates and shopSettings.
 *
 * All functions are server-only (imported only from Remix loaders/actions
 * and Cloud Functions). Never import this in client-side code.
 *
 * Security note: exemptionNumber is sensitive business data. Do not log it.
 */
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "./firebase.server";
import { toCertificate, toShopSettings } from "./types";
import type {
  Certificate,
  CertificateDoc,
  CertificateStatus,
  ShopSettings,
  ShopSettingsDoc,
} from "./types";

const CERTIFICATES = "certificates";
const SHOP_SETTINGS = "shopSettings";

// ── Certificate helpers ──────────────────────────────────────────────────────

export async function createCertificate(
  data: Omit<CertificateDoc, "createdAt" | "updatedAt" | "status" | "rejectionReason">
): Promise<string> {
  const ref = db.collection(CERTIFICATES).doc();
  await ref.set({
    ...data,
    status: "PENDING",
    rejectionReason: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function getCertificate(id: string): Promise<Certificate | null> {
  const doc = await db.collection(CERTIFICATES).doc(id).get();
  if (!doc.exists) return null;
  return toCertificate(doc.id, doc.data()!);
}

export async function updateCertificateStatus(
  id: string,
  status: CertificateStatus,
  extras?: { rejectionReason?: string }
): Promise<void> {
  await db
    .collection(CERTIFICATES)
    .doc(id)
    .update({
      status,
      rejectionReason: extras?.rejectionReason ?? null,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function getCertificatesByShop(
  shop: string,
  status?: CertificateStatus
): Promise<Certificate[]> {
  let query = db
    .collection(CERTIFICATES)
    .where("shop", "==", shop)
    .orderBy("createdAt", "desc");

  if (status) {
    query = query.where("status", "==", status) as typeof query;
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => toCertificate(doc.id, doc.data()));
}

export async function getCertificatesExpiringSoon(
  shop: string,
  withinDays = 30
): Promise<Certificate[]> {
  const cutoff = Timestamp.fromDate(
    new Date(Date.now() + withinDays * 24 * 60 * 60 * 1000)
  );
  const snapshot = await db
    .collection(CERTIFICATES)
    .where("shop", "==", shop)
    .where("status", "==", "APPROVED")
    .where("expirationDate", "<=", cutoff)
    .orderBy("expirationDate", "asc")
    .get();
  return snapshot.docs.map((doc) => toCertificate(doc.id, doc.data()));
}

/** Used by the expiration scheduled function — queries across all shops. */
export async function getAllExpiredCertificates(): Promise<Certificate[]> {
  const now = Timestamp.now();
  const snapshot = await db
    .collection(CERTIFICATES)
    .where("status", "==", "APPROVED")
    .where("expirationDate", "<=", now)
    .get();
  return snapshot.docs.map((doc) => toCertificate(doc.id, doc.data()));
}

export async function getDashboardCounts(shop: string): Promise<{
  total: number;
  pending: number;
  approved: number;
  expiringSoon: number;
}> {
  const [allSnap, pendingSnap, approvedSnap, expiringSoonList] =
    await Promise.all([
      db.collection(CERTIFICATES).where("shop", "==", shop).count().get(),
      db
        .collection(CERTIFICATES)
        .where("shop", "==", shop)
        .where("status", "==", "PENDING")
        .count()
        .get(),
      db
        .collection(CERTIFICATES)
        .where("shop", "==", shop)
        .where("status", "==", "APPROVED")
        .count()
        .get(),
      getCertificatesExpiringSoon(shop, 30),
    ]);

  return {
    total: allSnap.data().count,
    pending: pendingSnap.data().count,
    approved: approvedSnap.data().count,
    expiringSoon: expiringSoonList.length,
  };
}

// ── ShopSettings helpers ─────────────────────────────────────────────────────

export async function getShopSettings(
  shop: string
): Promise<ShopSettings | null> {
  const doc = await db.collection(SHOP_SETTINGS).doc(shop).get();
  if (!doc.exists) return null;
  return toShopSettings(doc.id, doc.data()!);
}

export async function upsertShopSettings(
  shop: string,
  data: Partial<ShopSettingsDoc>
): Promise<void> {
  await db
    .collection(SHOP_SETTINGS)
    .doc(shop)
    .set({ shop, ...data }, { merge: true });
}

/** Called at app install — initializes shopSettings with plan detection. */
export async function initShopSettings(
  shop: string,
  planIsPlus: boolean
): Promise<void> {
  await db
    .collection(SHOP_SETTINGS)
    .doc(shop)
    .set(
      {
        shop,
        planIsPlus,
        onboardingCompleted: false,
        usesThirdPartyTaxService: false,
        thirdPartyTaxServiceName: null,
        geminiExtractionEnabled: false,
      },
      { merge: true }
    );
}
