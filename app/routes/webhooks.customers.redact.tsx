import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { deleteCustomerData } from "../lib/firestore.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`[webhook] ${topic} received for shop: ${shop}`);
  
  const customerId = payload?.customer?.id;
  if (customerId) {
    try {
      await deleteCustomerData(shop, String(customerId));
      console.log(`[webhook] Redacted data for customer ${customerId} on shop ${shop}`);
    } catch (e) {
      console.error(`[webhook] Failed to redact data for customer ${customerId}:`, e);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  return new Response(null, { status: 200 });
};
