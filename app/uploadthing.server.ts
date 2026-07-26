import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const uploadRouter = {
  certificateUploader: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    // Middleware runs on the server before upload
    .middleware(async ({ req }) => {
      // In a real production app, we would verify the Shopify App Proxy signature here
      // and ensure the customer is logged in. But for this MVP proxy endpoint,
      // we just allow the upload and associate it in the subsequent form submit.
      return { uploadedBy: "storefront-proxy" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.uploadedBy);
      console.log("file url", file.url);
      console.log("file key", file.key);
      
      // We don't save to Firestore here because we need the customer's jurisdiction 
      // and exemption number, which come from the form submit, not the file upload.
      // We just return the key to the client.
      return { fileKey: file.key };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof uploadRouter;
