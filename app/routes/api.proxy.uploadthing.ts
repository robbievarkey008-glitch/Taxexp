import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { createRouteHandler } from "uploadthing/remix";
import { uploadRouter } from "../uploadthing.server";

const handlers = createRouteHandler({
  router: uploadRouter,
  config: {
    token: process.env.UPLOADTHING_TOKEN,
  },
});

// Add CORS headers to every response so the uploadthing client can call
// this endpoint directly from the storefront (cross-origin).
function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "*");
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Handle OPTIONS preflight requests for CORS
export const loader = async (args: LoaderFunctionArgs) => {
  if (args.request.method === "OPTIONS") {
    return withCors(new Response(null, { status: 204 }));
  }
  const res = await handlers.loader(args);
  return withCors(res);
};

export const action = async (args: ActionFunctionArgs) => {
  if (args.request.method === "OPTIONS") {
    return withCors(new Response(null, { status: 204 }));
  }
  console.log("INCOMING HEADERS VIA ACTION:", Object.fromEntries(args.request.headers));
  const res = await handlers.action(args);
  return withCors(res);
};
