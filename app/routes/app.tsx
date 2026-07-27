import { useEffect } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useRouteError, isRouteErrorResponse } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";

import { authenticate } from "../shopify.server";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("LOADER HIT URL:", request.url);
  await authenticate.admin(request);
  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <PolarisAppProvider i18n={enTranslations}>
        <ui-nav-menu>
          <a href="/app" rel="home">Home</a>
          <a href="/app/settings">Settings</a>
        </ui-nav-menu>
        <Outlet />
      </PolarisAppProvider>
    </AppProvider>
  );
}

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
