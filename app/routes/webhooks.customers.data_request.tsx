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
import { getCustomerData } from "../lib/firestore.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`[webhook] ${topic} received for shop: ${shop}`);

  const customerId = payload?.customer?.id;
  if (customerId) {
    try {
      const certificates = await getCustomerData(shop, String(customerId));
      
      const responseData = {
        message: "Customer data retrieved successfully",
        data: {
          certificates: certificates.map(cert => ({
            id: cert.id,
            jurisdiction: cert.jurisdiction,
            status: cert.status,
            createdAt: cert.createdAt?.toISOString(),
          }))
        }
      };
      
      // In a real production app, Shopify requires you to process this asynchronously
      // and email the data to the customer, but for the webhook itself, we return 200 OK.
      console.log(`[webhook] Processed data request for customer ${customerId}`);
    } catch (e) {
      console.error(`[webhook] Failed to process data request for customer ${customerId}:`, e);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  return new Response(null, { status: 200 });
};
