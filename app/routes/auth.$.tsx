
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

import { useState } from "react";

export default function Auth() {
  const [exitUrl, setExitUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const exitIframe = url.searchParams.get("exitIframe");
    if (exitIframe) {
      setExitUrl(exitIframe);
      // Attempt automatic redirect
      try {
        window.top!.location.href = exitIframe;
      } catch (e) {
        console.error("Auto-redirect failed, waiting for user click");
      }
    }
  }, []);

  if (!exitUrl) return null;

  return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h2>Action Required</h2>
      <p>Your browser blocked the automatic redirect to the billing approval page.</p>
      <a 
        href={exitUrl} 
        target="_top" 
        style={{ 
          display: "inline-block", 
          marginTop: "20px", 
          padding: "12px 24px", 
          background: "#0066FF", 
          color: "white", 
          textDecoration: "none", 
          borderRadius: "8px",
          fontWeight: "bold"
        }}
      >
        Click Here to Continue
      </a>
    </div>
  );
}
