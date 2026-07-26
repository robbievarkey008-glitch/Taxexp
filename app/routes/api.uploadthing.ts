import { createRouteHandler } from "uploadthing/remix";
import { uploadRouter } from "../uploadthing.server";

const handlers = createRouteHandler({
  router: uploadRouter,
  config: {
    callbackUrl: process.env.SHOPIFY_APP_URL ? `${process.env.SHOPIFY_APP_URL}/api/uploadthing` : undefined,
  },
});

export const action = handlers.action;
export const loader = handlers.loader;
