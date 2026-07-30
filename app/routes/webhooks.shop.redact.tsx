/**
 * SHOP_REDACT webhook — mandatory privacy webhook.
 *
 * Shopify sends this 48 hours after a store owner uninstalls the app.
 * All shop data must be deleted.
 *
 * Currently: stub returning 200 OK.
 * TODO (before App Store submission): implement full shop data deletion:
 * 1. Delete all documents in `certificates` where shop === shop
 * 2. Delete all files in Firebase Storage under the shop's path
 * 3. Delete the `shopSettings` document for this shop
 * 4. Delete all sessions for this shop
 */
import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { deleteShopData } from "../lib/firestore.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop } = await authenticate.webhook(request);

  console.log(`[webhook] ${topic} received for shop: ${shop}`);

  try {
    await deleteShopData(shop);
    console.log(`[webhook] Redacted all data for shop ${shop}`);
  } catch (e) {
    console.error(`[webhook] Failed to redact data for shop ${shop}:`, e);
    return new Response("Internal Server Error", { status: 500 });
  }

  return new Response(null, { status: 200 });
};
