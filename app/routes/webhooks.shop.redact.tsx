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

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop } = await authenticate.webhook(request);

  console.log(`[webhook] ${topic} received for shop: ${shop}`);

  // TODO: Implement full shop data deletion

  return new Response(null, { status: 200 });
};
