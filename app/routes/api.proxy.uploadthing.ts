import { createRouteHandler } from "uploadthing/remix";
import { uploadRouter } from "../uploadthing.server";

const handlers = createRouteHandler({
  router: uploadRouter,
  config: {
    token: process.env.UPLOADTHING_TOKEN,
  },
});

export const action = handlers.action;
export const loader = handlers.loader;
