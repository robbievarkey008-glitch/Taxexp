import React, { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSubmit, useNavigation } from "react-router";
import { authenticate } from "../shopify.server";
import { getShopSettings, upsertShopSettings } from "../lib/firestore.server";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Button,
  Banner,
  RadioButton,
  TextField,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("ONBOARDING LOADER HIT:", request.url);
  console.log("ONBOARDING HEADERS:", Object.fromEntries(request.headers.entries()));
  
  try {
    const { session, redirect } = await authenticate.admin(request);
    console.log("ONBOARDING AUTH SUCCESS! Shop:", session.shop);
    const settings = await getShopSettings(session.shop);
    if (settings?.onboardingCompleted) {
      return redirect("/app");
    }
    return { shop: session.shop };
  } catch (error) {
    console.log("ONBOARDING AUTH FAILED!", error);
    throw error;
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, redirect } = await authenticate.admin(request);
  const formData = await request.formData();

  const taxService = formData.get("taxService") as string;
  const thirdPartyName = formData.get("thirdPartyName") as string;

  const usesThirdPartyTaxService = taxService !== "shopify";

  await upsertShopSettings(session.shop, {
    onboardingCompleted: true,
    usesThirdPartyTaxService,
    thirdPartyTaxServiceName: usesThirdPartyTaxService ? (thirdPartyName || taxService) : null,
  });

  return redirect("/app");
};

export default function Onboarding() {
  const { shop } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [taxService, setTaxService] = useState<string>("shopify");
  const [thirdPartyName, setThirdPartyName] = useState("");

  const handleComplete = () => {
    submit({ taxService, thirdPartyName }, { method: "post" });
  };

  return (
    <Page title="Welcome to Tax Exemption Manager">
      <TitleBar title="Welcome to Tax Exemption Manager" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Store Configuration
              </Text>
              <Text as="p" variant="bodyMd">
                Before we can start accepting tax exemption certificates, we need to know how you handle taxes on Shopify. 
                Our app utilizes Shopify's native tax exemption GraphQL mutations to set tax status.
              </Text>

              {taxService !== "shopify" && (
                <Banner title="Important Warning" tone="warning">
                  <p>
                    Because you use a third-party tax engine, setting native Shopify tax exemptions 
                    <strong> may not prevent tax calculation at checkout</strong>. Third-party tax engines 
                    often rely on customer tags or their own exemption databases (e.g., Avalara CertCapture).
                  </p>
                  <p style={{ marginTop: "10px" }}>
                    Please verify with your tax provider that Shopify's native <code>tax_exemptions</code> field overrides their calculation, 
                    or set up automation (like Shopify Flow) to map these approvals into your third-party system.
                  </p>
                </Banner>
              )}

              <BlockStack gap="200">
                <Text as="h3" variant="headingSm">Which tax service do you use for checkout?</Text>
                
                <RadioButton
                  label="Shopify Native Tax (Default)"
                  helpText="I use Shopify's built-in tax engine."
                  checked={taxService === "shopify"}
                  onChange={() => setTaxService("shopify")}
                  id="shopify"
                  name="taxService"
                />
                
                <RadioButton
                  label="Avalara AvaTax"
                  helpText="I use the Avalara app to calculate taxes."
                  checked={taxService === "avalara"}
                  onChange={() => setTaxService("avalara")}
                  id="avalara"
                  name="taxService"
                />
                
                <RadioButton
                  label="Vertex"
                  checked={taxService === "vertex"}
                  onChange={() => setTaxService("vertex")}
                  id="vertex"
                  name="taxService"
                />

                <RadioButton
                  label="Other third-party service"
                  checked={taxService === "other"}
                  onChange={() => setTaxService("other")}
                  id="other"
                  name="taxService"
                />
                
                {taxService === "other" && (
                  <div style={{ marginLeft: '28px', marginTop: '8px' }}>
                    <TextField
                      label="Service Name"
                      labelHidden
                      value={thirdPartyName}
                      onChange={setThirdPartyName}
                      autoComplete="off"
                      placeholder="e.g. TaxJar"
                    />
                  </div>
                )}
              </BlockStack>

              <div style={{ marginTop: '20px' }}>
                <Button variant="primary" onClick={handleComplete} loading={isSubmitting}>
                  Complete Setup
                </Button>
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export function ErrorBoundary() {
  const error = useRouteError() as any;
  if (error?.status === 410 || error?.status === 401 || error?.status === 403 || error?.status === 200) {
    return <Bounce />;
  }
  return null;
}

function Bounce() {
  const { useEffect } = React;
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
