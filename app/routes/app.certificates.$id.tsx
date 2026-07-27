import { useState, useCallback } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSubmit, useNavigation, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { getCertificate, updateCertificateStatus, getShopSettings } from "../lib/firestore.server";
import { getFileViewUrl } from "../lib/storage.server";
import { sendCustomerNotification } from "../lib/email.server";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Button,
  Badge,
  Banner,
  Modal,
  TextField,
  InlineStack,
  Box,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const id = params.id;

  if (!id) {
    throw new Response("Missing certificate ID", { status: 400 });
  }

  const cert = await getCertificate(id);
  if (!cert || cert.shop !== shop) {
    throw new Response("Certificate not found", { status: 404 });
  }

  // Get a short-lived view URL for the file from UploadThing
  const fileUrl = await getFileViewUrl(cert.fileStoragePath);

  // Serialize Timestamps for Remix
  const serializedCert = {
    ...cert,
    createdAt: cert.createdAt.toDate().toISOString(),
    updatedAt: cert.updatedAt.toDate().toISOString(),
    expirationDate: cert.expirationDate ? cert.expirationDate.toDate().toISOString() : null,
  };

  return { cert: serializedCert, fileUrl };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;
  const id = params.id;

  if (!id) {
    return { error: "Missing certificate ID" };
  }

  const cert = await getCertificate(id);
  if (!cert || cert.shop !== shop) {
    return { error: "Certificate not found" };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "APPROVE") {
      // 1. Update Shopify Customer or Company Location
      if (cert.buyerType === "customer") {
        const response = await admin.graphql(
          `#graphql
          mutation customerAddTaxExemptions($customerId: ID!, $taxExemptions: [TaxExemption!]!) {
            customerAddTaxExemptions(customerId: $customerId, taxExemptions: $taxExemptions) {
              userErrors { field message }
            }
          }`,
          {
            variables: {
              customerId: cert.shopifyCustomerId,
              taxExemptions: [cert.taxExemptionCode],
            },
          }
        );
        const json = await response.json();
        if (json.data?.customerAddTaxExemptions?.userErrors?.length) {
          throw new Error(json.data.customerAddTaxExemptions.userErrors[0].message);
        }
      } else if (cert.buyerType === "company_location" && cert.shopifyCompanyLocationId) {
        const response = await admin.graphql(
          `#graphql
          mutation companyLocationAssignTaxExemptions($companyLocationId: ID!, $taxExemptions: [TaxExemption!]!) {
            companyLocationAssignTaxExemptions(companyLocationId: $companyLocationId, taxExemptions: $taxExemptions) {
              userErrors { field message code }
            }
          }`,
          {
            variables: {
              companyLocationId: cert.shopifyCompanyLocationId,
              taxExemptions: [cert.taxExemptionCode],
            },
          }
        );
        const json = await response.json();
        if (json.data?.companyLocationAssignTaxExemptions?.userErrors?.length) {
          throw new Error(json.data.companyLocationAssignTaxExemptions.userErrors[0].message);
        }
      }

      // 2. Update Firestore status
      await updateCertificateStatus(id, "APPROVED");
      
      const settings = await getShopSettings(shop);
      if (settings?.customerNotificationsEnabled && cert.customerEmail && cert.customerEmail.includes("@")) {
        await sendCustomerNotification(cert.customerEmail, shop, "APPROVED");
      }

      return { success: true };

    } else if (intent === "REVOKE") {
      // 1. Remove Shopify Exemption
      if (cert.buyerType === "customer") {
        const response = await admin.graphql(
          `#graphql
          mutation customerRemoveTaxExemptions($customerId: ID!, $taxExemptions: [TaxExemption!]!) {
            customerRemoveTaxExemptions(customerId: $customerId, taxExemptions: $taxExemptions) {
              userErrors { field message }
            }
          }`,
          {
            variables: {
              customerId: cert.shopifyCustomerId,
              taxExemptions: [cert.taxExemptionCode],
            },
          }
        );
        const json = await response.json();
        if (json.data?.customerRemoveTaxExemptions?.userErrors?.length) {
          throw new Error(json.data.customerRemoveTaxExemptions.userErrors[0].message);
        }
      } else if (cert.buyerType === "company_location" && cert.shopifyCompanyLocationId) {
        const response = await admin.graphql(
          `#graphql
          mutation companyLocationRemoveTaxExemptions($companyLocationId: ID!, $taxExemptions: [TaxExemption!]!) {
            companyLocationRemoveTaxExemptions(companyLocationId: $companyLocationId, taxExemptions: $taxExemptions) {
              userErrors { field message code }
            }
          }`,
          {
            variables: {
              companyLocationId: cert.shopifyCompanyLocationId,
              taxExemptions: [cert.taxExemptionCode],
            },
          }
        );
        const json = await response.json();
        if (json.data?.companyLocationRemoveTaxExemptions?.userErrors?.length) {
          throw new Error(json.data.companyLocationRemoveTaxExemptions.userErrors[0].message);
        }
      }

      // 2. Update Firestore status
      await updateCertificateStatus(id, "REJECTED", { rejectionReason: "Exemption was manually revoked by admin." });
      
      const settings = await getShopSettings(shop);
      if (settings?.customerNotificationsEnabled && cert.customerEmail && cert.customerEmail.includes("@")) {
        await sendCustomerNotification(cert.customerEmail, shop, "REVOKED", "Exemption was manually revoked by admin.");
      }

      return { success: true };

    } else if (intent === "REJECT") {
      const reason = formData.get("rejectionReason") as string;
      if (!reason) {
        return { error: "Rejection reason is required." };
      }
      
      // Update Firestore status
      await updateCertificateStatus(id, "REJECTED", { rejectionReason: reason });
      
      const settings = await getShopSettings(shop);
      if (settings?.customerNotificationsEnabled && cert.customerEmail && cert.customerEmail.includes("@")) {
        await sendCustomerNotification(cert.customerEmail, shop, "REJECTED", reason);
      }

      return { success: true };
    }
  } catch (err: any) {
    console.error("[Action Error]", err);
    return { error: err.message || "An unexpected error occurred." };
  }

  return { error: "Invalid intent" };
};

export default function CertificateDetail() {
  const { cert, fileUrl } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const shopify = useAppBridge();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const isSubmitting = navigation.state === "submitting";

  const handleApprove = () => {
    submit({ intent: "APPROVE" }, { method: "post" });
  };

  const handleRevoke = () => {
    submit({ intent: "REVOKE" }, { method: "post" });
  };

  const handleReject = () => {
    submit({ intent: "REJECT", rejectionReason }, { method: "post" });
    setRejectModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge tone="success">Approved</Badge>;
      case "PENDING":
        return <Badge tone="attention">Pending</Badge>;
      case "REJECTED":
        return <Badge tone="critical">Rejected</Badge>;
      case "EXPIRED":
        return <Badge tone="critical">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Page
      backAction={{ content: "Dashboard", onAction: () => navigate("/app") }}
      title="Certificate Details"
      titleMetadata={getStatusBadge(cert.status)}
      primaryAction={
        cert.status === "PENDING" ? {
          content: "Approve",
          onAction: handleApprove,
          loading: isSubmitting,
          disabled: isSubmitting,
        } : cert.status === "REJECTED" ? {
          content: "Approve Exemption",
          onAction: handleApprove,
          loading: isSubmitting,
          disabled: isSubmitting,
        } : undefined
      }
      secondaryActions={
        cert.status === "PENDING" ? [
          {
            content: "Reject",
            destructive: true,
            onAction: () => setRejectModalOpen(true),
            loading: isSubmitting,
            disabled: isSubmitting,
          },
        ] : cert.status === "APPROVED" ? [
          {
            content: "Revoke Exemption",
            destructive: true,
            onAction: handleRevoke,
            loading: isSubmitting,
            disabled: isSubmitting,
          }
        ] : undefined
      }
    >
      <TitleBar title="Certificate Details" />
      <Layout>
        <Layout.Section>
          {cert.status === "REJECTED" && cert.rejectionReason && (
            <Box paddingBlockEnd="400">
              <Banner title="Certificate rejected" tone="critical">
                <p><strong>Reason:</strong> {cert.rejectionReason}</p>
              </Banner>
            </Box>
          )}

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Exemption Information
              </Text>

              <InlineStack gap="400" wrap={false} align="space-between">
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">Customer Name</Text>
                  <Text as="p" variant="bodyMd">{cert.customerName}</Text>
                </BlockStack>
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">Email</Text>
                  <Text as="p" variant="bodyMd">{cert.customerEmail}</Text>
                </BlockStack>
              </InlineStack>

              <InlineStack gap="400" wrap={false} align="space-between">
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">Jurisdiction</Text>
                  <Text as="p" variant="bodyMd">{cert.jurisdiction}</Text>
                </BlockStack>
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">Exemption Number</Text>
                  <Text as="p" variant="bodyMd">{cert.exemptionNumber}</Text>
                </BlockStack>
              </InlineStack>
              
              <InlineStack gap="400" wrap={false} align="space-between">
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">Buyer Type</Text>
                  <Text as="p" variant="bodyMd">{cert.buyerType === "customer" ? "B2C Customer" : "B2B Company Location"}</Text>
                </BlockStack>
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">Date Submitted</Text>
                  <Text as="p" variant="bodyMd">{new Date(cert.createdAt).toLocaleDateString()}</Text>
                </BlockStack>
              </InlineStack>

            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Uploaded Document
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Review the uploaded certificate to ensure the details match the jurisdiction and exemption number provided.
              </Text>
              <Button url={fileUrl} target="_blank" fullWidth>
                View Document
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      <Modal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Certificate"
        primaryAction={{
          content: "Reject",
          onAction: handleReject,
          destructive: true,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setRejectModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Text as="p" variant="bodyMd">
              Please provide a reason for rejecting this certificate. The customer will be able to see this reason.
            </Text>
            <TextField
              label="Rejection reason"
              value={rejectionReason}
              onChange={setRejectionReason}
              multiline={4}
              autoComplete="off"
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
