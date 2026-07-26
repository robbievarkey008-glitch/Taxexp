/**
 * Firebase Cloud Functions — Tax Exemption Certificate Manager
 *
 * Functions defined here:
 *   - expireCertificates: Daily scheduled function (Phase 5, implemented there)
 *
 * This file is the entry point. Import all functions from their own modules
 * and re-export them here so Firebase picks them up.
 */
import { initializeApp } from "firebase-admin/app";

// Initialize Firebase Admin SDK for use in all functions
initializeApp();

// Phase 5: expiration enforcement (imported when implemented)
// export { expireCertificates } from "./expiration";

// Placeholder export to satisfy TypeScript during Phase 1
export const _placeholder = null;
