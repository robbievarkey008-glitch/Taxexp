import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const uploadRouter = {
  certificateUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    image: { maxFileSize: "16MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    // We only need the fileKey from UploadThing to store in Firestore.
    // We return it here; UploadThing makes it available to the client via the onClientUploadComplete callback.
    return { fileKey: file.key };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
