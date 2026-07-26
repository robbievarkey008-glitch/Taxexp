import type { ActionFunctionArgs } from "react-router";
import { expireCertificates } from "../lib/cron.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  // 1. Verify Authorization Header matches the Cron Secret
  const authHeader = request.headers.get("Authorization");
  const cronSecret = process.env.EXPIRATION_CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Call the server action to revoke expired certificates
    const revokedCount = await expireCertificates();
    
    return Response.json({ success: true, revokedCount });
  } catch (err: any) {
    console.error("Cron Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
};
