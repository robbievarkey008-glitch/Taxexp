import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

/**
 * Generate a short-lived presigned URL to view a certificate file.
 */
export async function getFileViewUrl(fileKey: string): Promise<string> {
  const { url } = await utapi.getSignedURL(fileKey, { expiresIn: "15m" });
  if (!url) {
    throw new Error("Failed to generate presigned URL for fileKey: " + fileKey);
  }
  return url;
}

/**
 * Generate a presigned URL to upload a certificate (NOT NEEDED FOR UPLOADTHING).
 * UploadThing generates its own presigned URLs in the client SDK `uploadFiles()`.
 */
export async function getFileUploadUrl(fileKey: string, contentType: string): Promise<string> {
  throw new Error("getFileUploadUrl is deprecated. Use the UploadThing client SDK to handle uploads directly.");
}

/**
 * Delete a certificate file from Storage.
 */
export async function deleteFile(fileKey: string): Promise<void> {
  await utapi.deleteFiles(fileKey);
}
