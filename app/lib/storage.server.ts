/**
 * UploadThing server-side helpers for certificate file management.
 *
 * UploadThing handles file uploads directly from the browser to their CDN —
 * the file never passes through the Remix server. We get back a file key
 * which we store in Firestore as `fileStoragePath`.
 *
 * Free tier: 2 GB storage, no credit card required.
 *
 * Required environment variable:
 *   UPLOADTHING_TOKEN  — from uploadthing.com dashboard → App → API Key
 *
 * SECURITY:
 * - Files are not publicly accessible without a valid signed URL
 * - We do NOT store public URLs in Firestore. We store the fileKey only.
 * - Access URLs are generated on-demand with short TTL via getFileViewUrl()
 * - Exemption certificate contents are NOT logged anywhere.
 *
 * Field convention: Firestore `fileStoragePath` stores the UploadThing fileKey
 * (e.g. "4XyZ8a3bQwEr...") — an opaque string, not a URL.
 */
import { UTApi } from "uploadthing/server";

// Singleton UTApi instance
let utapi: UTApi;

function getUtApi(): UTApi {
  if (!utapi) {
    if (!process.env.UPLOADTHING_TOKEN) {
      throw new Error("UPLOADTHING_TOKEN environment variable is not set.");
    }
    utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });
  }
  return utapi;
}

/**
 * Generate a short-lived presigned URL to view a certificate file.
 * Call only when the merchant clicks to view — never pre-generate or cache.
 */
export async function getFileViewUrl(fileKey: string): Promise<string> {
  const api = getUtApi();
  const response = await api.getSignedURL(fileKey, {
    expiresIn: "5 minutes",
  });
  return response.url;
}

/**
 * Delete a certificate file from UploadThing.
 * Called during CUSTOMERS_REDACT and SHOP_REDACT webhook handling.
 */
export async function deleteFile(fileKey: string): Promise<void> {
  const api = getUtApi();
  await api.deleteFiles([fileKey]);
}
