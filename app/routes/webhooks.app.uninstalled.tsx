/**
 * APP_UNINSTALLED webhook — cleans up all sessions for the uninstalled shop.
 *
 * Note: Full shop data deletion (certificates, shopSettings, Storage files)
 * happens via the SHOP_REDACT webhook 48 hours after uninstall, not here.
 */
import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { sessionStorage } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`[webhook] ${topic} received for shop: ${shop}`);

  // Clean up all sessions for this shop from Firestore
  if (session) {
    const sessions = await sessionStorage.findSessionsByShop(shop);
    const sessionIds = sessions.map((s) => s.id);
    if (sessionIds.length > 0) {
      await sessionStorage.deleteSessions(sessionIds);
    }
  }

  return new Response(null, { status: 200 });
};
