import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "./firebase.server";
import { toCertificate, type Certificate } from "./types";
import { unauthenticated } from "../shopify.server";

export async function expireCertificates(): Promise<number> {
  const now = Timestamp.now();
  
  // Find all approved certificates that have passed their expiration date
  const snapshot = await db.collection("certificates")
    .where("status", "==", "APPROVED")
    .where("expirationDate", "<", now)
    .get();

  if (snapshot.empty) return 0;

  let revokedCount = 0;

  // Group by shop so we only initialize the admin client once per shop
  const certsByShop: Record<string, Certificate[]> = {};
  for (const doc of snapshot.docs) {
    const cert = toCertificate(doc.id, doc.data());
    if (!certsByShop[cert.shop]) certsByShop[cert.shop] = [];
    certsByShop[cert.shop].push(cert);
  }

  for (const [shop, certs] of Object.entries(certsByShop)) {
    try {
      // Get an offline session admin client for this shop
      const { admin } = await unauthenticated.admin(shop);

      for (const cert of certs) {
        try {
          // 1. Remove exemption from Shopify
          if (cert.buyerType === "customer") {
            // Re-assign empty array to clear exemptions
            await admin.graphql(
              `#graphql
              mutation customerRemoveTaxExemptions($customerId: ID!, $taxExemptions: [TaxExemption!]!) {
                customerRemoveTaxExemptions(customerId: $customerId, taxExemptions: $taxExemptions) {
                  userErrors { field message }
                }
              }`,
              { variables: { customerId: cert.shopifyCustomerId, taxExemptions: [cert.taxExemptionCode] } }
            );
          } else if (cert.buyerType === "company_location" && cert.shopifyCompanyLocationId) {
            await admin.graphql(
              `#graphql
              mutation companyLocationRemoveTaxExemptions($companyLocationId: ID!, $taxExemptions: [TaxExemption!]!) {
                companyLocationRemoveTaxExemptions(companyLocationId: $companyLocationId, taxExemptions: $taxExemptions) {
                  userErrors { field message }
                }
              }`,
              { variables: { companyLocationId: cert.shopifyCompanyLocationId, taxExemptions: [cert.taxExemptionCode] } }
            );
          }

          // 2. Mark as expired in Firestore
          await db.collection("certificates").doc(cert.id).update({
            status: "EXPIRED",
            updatedAt: FieldValue.serverTimestamp(),
          });
          
          revokedCount++;
        } catch (err) {
          console.error(`Failed to revoke cert ${cert.id} for shop ${shop}:`, err);
        }
      }
    } catch (err) {
      console.error(`Failed to initialize admin for shop ${shop}:`, err);
    }
  }

  return revokedCount;
}
