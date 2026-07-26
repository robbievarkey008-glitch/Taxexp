/**
 * Firebase Admin SDK singleton for server-side use.
 *
 * Reads credentials from environment variables. In development, the Firebase
 * emulator is used automatically when FIREBASE_EMULATOR_HOST is set (which
 * firebase emulators:start handles via FIRESTORE_EMULATOR_HOST etc.).
 *
 * Required environment variables:
 *   FIREBASE_PROJECT_ID     - your Firebase project ID
 *   FIREBASE_CLIENT_EMAIL   - service account client email
 *   FIREBASE_PRIVATE_KEY    - service account private key (with \n escaped)
 *
 * In local dev with emulators, only FIREBASE_PROJECT_ID is required.
 */
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App;
let db: Firestore;

function initFirebase() {
  if (getApps().length > 0) {
    app = getApps()[0]!;
  } else {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error("FIREBASE_PROJECT_ID environment variable is not set.");
    }

    // When running against emulators (FIRESTORE_EMULATOR_HOST is set by
    // firebase emulators:start), the Admin SDK connects to them automatically.
    // No credentials needed for emulator connections.
    const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;

    if (isEmulator) {
      app = initializeApp({ projectId });
    } else {
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

      if (!clientEmail || !privateKey) {
        throw new Error(
          "FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be set in production."
        );
      }

      app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    }
  }

  db = getFirestore(app);
}

initFirebase();

export { app, db };
