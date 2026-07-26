/**
 * Firestore-backed session storage for the Shopify app.
 *
 * Implements the SessionStorage interface required by
 * @shopify/shopify-app-react-router, replacing the default Prisma adapter.
 *
 * Collection: `sessions/{sessionId}`
 * Documents are small (< 1KB), reads are key-value lookups — perfect fit
 * for Firestore without needing compound queries on this collection.
 */
import type { SessionStorage } from "@shopify/shopify-app-session-storage";
import { Session } from "@shopify/shopify-api";
import { db } from "./firebase.server";

const SESSIONS_COLLECTION = "sessions";

export class FirestoreSessionStorage implements SessionStorage {
  async storeSession(session: Session): Promise<boolean> {
    try {
      await db
        .collection(SESSIONS_COLLECTION)
        .doc(session.id)
        .set(sessionToDoc(session));
      return true;
    } catch (err) {
      console.error("[SessionStorage] storeSession failed:", err);
      return false;
    }
  }

  async loadSession(id: string): Promise<Session | undefined> {
    try {
      const doc = await db.collection(SESSIONS_COLLECTION).doc(id).get();
      if (!doc.exists) return undefined;
      return docToSession(doc.data()!);
    } catch (err) {
      console.error("[SessionStorage] loadSession failed:", err);
      return undefined;
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      await db.collection(SESSIONS_COLLECTION).doc(id).delete();
      return true;
    } catch (err) {
      console.error("[SessionStorage] deleteSession failed:", err);
      return false;
    }
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    try {
      const batch = db.batch();
      for (const id of ids) {
        batch.delete(db.collection(SESSIONS_COLLECTION).doc(id));
      }
      await batch.commit();
      return true;
    } catch (err) {
      console.error("[SessionStorage] deleteSessions failed:", err);
      return false;
    }
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    try {
      const snapshot = await db
        .collection(SESSIONS_COLLECTION)
        .where("shop", "==", shop)
        .get();
      return snapshot.docs.map((doc) => docToSession(doc.data()));
    } catch (err) {
      console.error("[SessionStorage] findSessionsByShop failed:", err);
      return [];
    }
  }
}

// ── Serialization helpers ────────────────────────────────────────────────────

function sessionToDoc(session: Session): Record<string, unknown> {
  return {
    id: session.id,
    shop: session.shop,
    state: session.state,
    isOnline: session.isOnline,
    scope: session.scope ?? null,
    expires: session.expires?.toISOString() ?? null,
    accessToken: session.accessToken ?? null,
    userId: session.onlineAccessInfo?.associated_user?.id?.toString() ?? null,
  };
}

function docToSession(data: Record<string, unknown>): Session {
  const session = new Session({
    id: data.id as string,
    shop: data.shop as string,
    state: data.state as string,
    isOnline: data.isOnline as boolean,
  });
  if (data.scope) session.scope = data.scope as string;
  if (data.expires) session.expires = new Date(data.expires as string);
  if (data.accessToken) session.accessToken = data.accessToken as string;
  return session;
}
