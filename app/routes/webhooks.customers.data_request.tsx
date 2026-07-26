/**
 * CUSTOMERS_DATA_REQUEST webhook — mandatory privacy webhook.
 *
 * Shopify sends this when a customer requests their data.
 * The merchant must respond to the customer directly.
 *
 * Currently: stub returning 200 OK.
 * TODO (before App Store submission): implement actual data export logic
 * that queries the `certificates` collection for this customer's records
 * and sends the result to the merchant's email.
 */
import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`[webhook] ${topic} received for shop: ${shop}`);
  // Log topic and shop only — do NOT log payload (contains customer PII)

  // TODO: Implement data export logic
  // 1. Query certificates collection where shop === shop AND customerEmail === payload.customer.email
  // 2. Compile a summary (dates, status, jurisdiction) — NOT file contents
  // 3. Email summary to merchant for manual customer response

  return new Response(null, { status: 200 });
};
