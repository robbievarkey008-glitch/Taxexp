/**
 * APP_SCOPES_UPDATE webhook — updates stored scope for a session.
 *
 * Fired when a merchant approves a scope change request.
 */
import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { sessionStorage } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { payload, session, topic, shop } = await authenticate.webhook(request);
  console.log(`[webhook] ${topic} received for shop: ${shop}`);

  const current = payload.current as string[];

  if (session) {
    session.scope = current.join(",");
    await sessionStorage.storeSession(session);
  }

  return new Response(null, { status: 200 });
};
