/**
 * CUSTOMERS_REDACT webhook — mandatory privacy webhook.
 *
 * Shopify sends this 10 days after a customer requests deletion,
 * or when a store owner requests it.
 *
 * Currently: stub returning 200 OK.
 * TODO (before App Store submission): implement actual redaction logic:
 * 1. Find all certificates for this customer (by shopifyCustomerId)
 * 2. Delete or anonymize PII fields (customerEmail, customerName, exemptionNumber)
 * 3. Delete the file from Firebase Storage (fileStoragePath)
 * 4. Retain status/dates for audit trail only, or delete entirely
 */
import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop } = await authenticate.webhook(request);

  console.log(`[webhook] ${topic} received for shop: ${shop}`);
  // Do NOT log payload — contains customer PII

  // TODO: Implement customer data redaction

  return new Response(null, { status: 200 });
};
