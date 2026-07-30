import "dotenv/config";
import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase credentials in .env");
  process.exit(1);
}

const app = initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
  storageBucket
});

async function setCors() {
  const bucket = getStorage(app).bucket();
  
  const corsConfiguration = [
    {
      maxAgeSeconds: 3600,
      method: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
      origin: ["*"],
      responseHeader: ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable"],
    },
  ];

  try {
    await bucket.setCorsConfiguration(corsConfiguration);
    console.log(`Successfully set CORS configuration for bucket: ${storageBucket}`);
  } catch (error) {
    console.error("Failed to set CORS:", error);
  }
}

setCors();
