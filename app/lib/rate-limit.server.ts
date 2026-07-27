import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebase.server";

/**
 * Validates if the given IP has exceeded the rate limit using Firestore.
 * This is robust across distributed serverless instances.
 * 
 * @param ip The IP address of the client
 * @param limit The maximum number of requests allowed in the time window (10 mins)
 * @returns boolean True if allowed, false if rate limited
 */
export async function rateLimit(ip: string | null, limit: number = 50): Promise<boolean> {
  if (!ip) return true; // Allow if IP can't be determined

  const ref = db.collection("rate_limits").doc(ip);
  const now = Date.now();
  const windowMs = 1000 * 60 * 10; // 10 minutes

  try {
    return await db.runTransaction(async (t) => {
      const doc = await t.get(ref);
      
      if (!doc.exists) {
        t.set(ref, { count: 1, resetAt: now + windowMs });
        return true;
      }

      const data = doc.data()!;
      if (now > data.resetAt) {
        // Window expired, reset
        t.set(ref, { count: 1, resetAt: now + windowMs });
        return true;
      }

      if (data.count >= limit) {
        return false; // Rate limit exceeded
      }

      // Increment
      t.update(ref, { count: FieldValue.increment(1) });
      return true;
    });
  } catch (err) {
    console.error("Rate limit transaction failed, failing open:", err);
    return true; // Fail open so we don't block legitimate users if Firestore has a blip
  }
}
