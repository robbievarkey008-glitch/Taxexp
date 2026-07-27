import { useState, useCallback } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "react-router";
import { authenticate } from "../shopify.server";
import { getShopSettings, upsertShopSettings } from "../lib/firestore.server";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  TextField,
  Checkbox,
  Button,
  FormLayout,
  Banner,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useEffect } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await getShopSettings(session.shop);
  
  if (!settings) {
    throw new Response("Shop settings not found. Please complete onboarding.", { status: 404 });
  }

  return { settings };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const adminNotificationsEnabled = formData.get("adminNotificationsEnabled") === "true";
  const adminNotificationEmail = formData.get("adminNotificationEmail")?.toString() || null;
  const customerNotificationsEnabled = formData.get("customerNotificationsEnabled") === "true";

  // Basic validation
  if (adminNotificationsEnabled && (!adminNotificationEmail || !adminNotificationEmail.includes("@"))) {
    return { error: "Please provide a valid email address for admin notifications." };
  }

  await upsertShopSettings(session.shop, {
    adminNotificationsEnabled,
    adminNotificationEmail,
    customerNotificationsEnabled,
  });

  return { success: true };
};

export default function Settings() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const shopify = useAppBridge();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show("Settings saved successfully");
    }
  }, [actionData, shopify]);

  const [adminEnabled, setAdminEnabled] = useState(settings.adminNotificationsEnabled || false);
  const [adminEmail, setAdminEmail] = useState(settings.adminNotificationEmail || "");
  const [customerEnabled, setCustomerEnabled] = useState(settings.customerNotificationsEnabled || false);

  const handleSave = () => {
    submit(
      {
        adminNotificationsEnabled: String(adminEnabled),
        adminNotificationEmail: adminEmail,
        customerNotificationsEnabled: String(customerEnabled),
      },
      { method: "post" }
    );
  };

  return (
    <Page title="Settings">
      <TitleBar title="Settings" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Admin Notifications
              </Text>
              <Text as="p" tone="subdued">
                Configure email alerts for when customers upload new tax exemption certificates.
              </Text>

              <FormLayout>
                <Checkbox
                  label="Email me when a new certificate is uploaded"
                  checked={adminEnabled}
                  onChange={setAdminEnabled}
                />
                
                {adminEnabled && (
                  <TextField
                    label="Admin Email Address"
                    type="email"
                    value={adminEmail}
                    onChange={setAdminEmail}
                    autoComplete="email"
                    helpText="We will send notifications to this address."
                  />
                )}
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Customer Notifications
              </Text>
              <Text as="p" tone="subdued">
                Keep your customers in the loop automatically.
              </Text>

              <FormLayout>
                <Checkbox
                  label="Email customers when their certificate is approved or rejected"
                  checked={customerEnabled}
                  onChange={setCustomerEnabled}
                  helpText="Customers will receive an email letting them know the outcome, including any rejection reason."
                />
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button variant="primary" loading={isSubmitting} disabled={isSubmitting} onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
