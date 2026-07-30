import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { getDashboardCounts, getCertificatesByShop, getShopSettings } from "../lib/firestore.server";
import {
  Page,
  Layout,
  Card,
  IndexTable,
  Badge,
  Text,
  BlockStack,
  InlineGrid,
  EmptyState,
  Banner,
  Box,
} from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, redirect } = await authenticate.admin(request);
  const shop = session.shop;

  const settings = await getShopSettings(shop);
  if (!settings?.onboardingCompleted) {
    return redirect("/app/onboarding");
  }

  const [counts, certificates] = await Promise.all([
    getDashboardCounts(shop),
    getCertificatesByShop(shop),
  ]);

  // Serialize Firestore Timestamps
  const serializedCertificates = certificates.map((cert) => ({
    ...cert,
    createdAt: cert.createdAt.toDate().toISOString(),
    updatedAt: cert.updatedAt.toDate().toISOString(),
    expirationDate: cert.expirationDate ? cert.expirationDate.toDate().toISOString() : null,
  }));

  return { counts, certificates: serializedCertificates, usesThirdPartyTaxService: settings.usesThirdPartyTaxService, thirdPartyName: settings.thirdPartyTaxServiceName };
};

export default function Dashboard() {
  const { counts, certificates, usesThirdPartyTaxService, thirdPartyName } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

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

  const rowMarkup = certificates.map((cert, index) => (
    <IndexTable.Row
      id={cert.id}
      key={cert.id}
      position={index}
      onClick={() => navigate(`/app/certificates/${cert.id}`)}
    >
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd" fontWeight="bold">
          {cert.customerName}
        </Text>
        <br />
        <Text as="span" variant="bodySm" tone="subdued">
          {cert.customerEmail}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{cert.jurisdiction}</IndexTable.Cell>
      <IndexTable.Cell>{cert.exemptionNumber}</IndexTable.Cell>
      <IndexTable.Cell>
        {new Date(cert.createdAt).toLocaleDateString()}
      </IndexTable.Cell>
      <IndexTable.Cell>{getStatusBadge(cert.status)}</IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page title="Tax Exemption Certificates">
      <Layout>
        {usesThirdPartyTaxService && (
          <Layout.Section>
             <Box paddingBlockEnd="400">
                <Banner title="Third-Party Tax Engine Active" tone="warning">
                  <p>
                    You indicated you use <strong>{thirdPartyName || "a third-party tax service"}</strong>. 
                    Please ensure you map these Shopify approvals into your tax system, as Shopify's native 
                    <code>tax_exemptions</code> field may be ignored at checkout.
                  </p>
                </Banner>
             </Box>
          </Layout.Section>
        )}

        <Layout.Section>
          <InlineGrid columns={{ xs: 2, md: 4 }} gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm" tone="subdued">
                  Total
                </Text>
                <Text as="p" variant="headingLg">
                  {counts.total}
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm" tone="subdued">
                  Pending Review
                </Text>
                <Text as="p" variant="headingLg">
                  {counts.pending}
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm" tone="subdued">
                  Approved
                </Text>
                <Text as="p" variant="headingLg">
                  {counts.approved}
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm" tone="subdued">
                  Expiring Soon (30d)
                </Text>
                <Text as="p" variant="headingLg">
                  {counts.expiringSoon}
                </Text>
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>

        <Layout.Section>
          <Card padding="0">
            {certificates.length === 0 ? (
              <EmptyState
                heading="No tax exemption certificates yet"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>When customers upload tax exemption certificates, they will appear here for your review.</p>
                <p style={{ marginTop: "10px" }}>
                  <strong>To get started:</strong> Add the "Tax Exemption Form" block to your Customer Account page in the Shopify Theme Editor.
                </p>
              </EmptyState>
            ) : (
              <IndexTable
                resourceName={{ singular: "certificate", plural: "certificates" }}
                itemCount={certificates.length}
                headings={[
                  { title: "Customer" },
                  { title: "Jurisdiction" },
                  { title: "Exemption #" },
                  { title: "Date Submitted" },
                  { title: "Status" },
                ]}
                selectable={false}
              >
                {rowMarkup}
              </IndexTable>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
