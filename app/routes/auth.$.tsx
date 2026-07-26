
import { useEffect } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useRouteError, isRouteErrorResponse } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

function Bounce() {
  useEffect(() => {
    if (!document.querySelector('script[src="https://cdn.shopify.com/shopifycloud/app-bridge.js"]')) {
      const script = document.createElement("script");
      script.src = "https://cdn.shopify.com/shopifycloud/app-bridge.js";
      script.setAttribute("data-api-key", "11ab8143e646040a98994029dda86aa8");
      document.head.appendChild(script);
    }
  }, []);
  return (
    <div>
      <script
        data-api-key="11ab8143e646040a98994029dda86aa8"
        src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
      ></script>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError() as any;

  if (isRouteErrorResponse(error) && (error.status === 410 || error.status === 401 || error.status === 403 || error.status === 200)) {
    return <Bounce />;
  }
  if (error?.status === 410 || error?.status === 401 || error?.status === 403 || error?.status === 200) {
    return <Bounce />;
  }

  return boundary.error(error);
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
