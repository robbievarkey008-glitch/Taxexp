import { useLoaderData } from "react-router";

export const loader = async () => {
  return { lastUpdated: new Date().toLocaleDateString() };
};

export default function TermsOfService() {
  const { lastUpdated } = useLoaderData<typeof loader>();

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px", fontFamily: "system-ui, sans-serif", lineHeight: "1.6", color: "#333" }}>
      <h1 style={{ borderBottom: "2px solid #0066FF", paddingBottom: "10px", color: "#0066FF" }}>Terms of Service</h1>
      <p><strong>Last Updated: {lastUpdated}</strong></p>

      <p>Welcome to Exemptify ("we," "our," or "us"). By installing and using our application ("the App") on your Shopify store, you agree to comply with and be bound by the following terms and conditions.</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By using the App, you agree to these Terms of Service. If you do not agree, do not install or use the App.</p>

      <h2>2. Description of Service</h2>
      <p>The App allows merchants to collect, store, and manage tax exemption certificates from their customers directly within their Shopify store. It provides a storefront portal for customers to upload documents and an admin dashboard for merchants to review and approve them.</p>

      <h2>3. Billing and Subscriptions</h2>
      <p>The App is billed through Shopify's unified billing system. By approving a subscription charge, you agree to the recurring fees displayed during the approval process. You may cancel your subscription at any time by uninstalling the App from your Shopify admin.</p>

      <h2>4. Merchant Responsibilities</h2>
      <p>As a merchant, you are solely responsible for:</p>
      <ul>
        <li>Ensuring that the tax exemption certificates collected are valid for your tax jurisdiction.</li>
        <li>Complying with all applicable local, state, and national tax laws.</li>
        <li>Properly configuring Shopify's native tax settings based on the metadata provided by the App.</li>
      </ul>
      <p>We are a software provider and do not provide tax, legal, or accounting advice.</p>

      <h2>5. Data Privacy and Security</h2>
      <p>We take the security of your data and your customers' data seriously. Our data handling practices are governed by our <a href="/privacy" style={{ color: "#0066FF" }}>Privacy Policy</a>. We comply with all mandatory Shopify data privacy guidelines, including GDPR data request and redaction webhooks.</p>

      <h2>6. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, we shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use or inability to use the App, including but not limited to incorrect tax assessments, audits, or penalties imposed by tax authorities.</p>

      <h2>7. Termination</h2>
      <p>We reserve the right to suspend or terminate your access to the App at any time for violations of these Terms. You may terminate this agreement at any time by uninstalling the App.</p>

      <h2>8. Changes to Terms</h2>
      <p>We may modify these Terms at any time. We will notify users of significant changes. Continued use of the App after modifications constitutes your acceptance of the new terms.</p>

      <h2>9. Contact Us</h2>
      <p>If you have any questions regarding these Terms, please contact us at support@example.com.</p>
    </div>
  );
}
