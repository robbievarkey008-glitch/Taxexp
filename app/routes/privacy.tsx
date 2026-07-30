import { useLoaderData } from "react-router";

export const loader = async () => {
  return { lastUpdated: new Date().toLocaleDateString() };
};

export default function PrivacyPolicy() {
  const { lastUpdated } = useLoaderData<typeof loader>();

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px", fontFamily: "system-ui, sans-serif", lineHeight: "1.6", color: "#333" }}>
      <h1 style={{ borderBottom: "2px solid #0066FF", paddingBottom: "10px", color: "#0066FF" }}>Privacy Policy</h1>
      <p><strong>Last Updated: {lastUpdated}</strong></p>

      <p>This Privacy Policy describes how your personal information is collected, used, and shared when you install or use the Exemptify app in connection with your Shopify-supported store.</p>

      <h2>1. Personal Information the App Collects</h2>
      <p>When you install the App, we are automatically able to access certain types of information from your Shopify account:</p>
      <ul>
        <li><strong>Customer Information:</strong> We access customer data (name, email) solely for the purpose of attaching tax-exemption records and verifying buyer identity.</li>
        <li><strong>Store Information:</strong> We access basic store information to properly route webhooks and process administrative notifications.</li>
      </ul>
      <p>Additionally, we collect the following information from your customers when they use the storefront proxy:</p>
      <ul>
        <li><strong>Tax Certificates:</strong> Files uploaded by your customers, which are stored securely via UploadThing.</li>
        <li><strong>Exemption Numbers:</strong> Used to validate tax-exempt status.</li>
      </ul>

      <h2>2. How Do We Use Your Personal Information?</h2>
      <p>We use the personal information we collect from you and your customers in order to provide the Service and to operate the App. Specifically, we use this information to:</p>
      <ul>
        <li>Apply tax-exempt metadata to customer profiles within your Shopify store.</li>
        <li>Store and retrieve uploaded tax documents for compliance and verification purposes.</li>
        <li>Send automated administrative email notifications regarding expiring certificates.</li>
      </ul>

      <h2>3. Sharing Your Personal Information</h2>
      <p>We do not sell, rent, or trade your personal information to third parties. We share information only with service providers required to operate the app (e.g., Vercel for hosting, Resend for emails, UploadThing for file storage), and only to the extent necessary to provide the service.</p>

      <h2>4. Data Retention</h2>
      <p>When a customer uploads a tax certificate through the App, we will maintain that information for your records securely. You can request deletion of this data at any time by uninstalling the app, which triggers mandatory Shopify data erasure webhooks.</p>

      <h2>5. Changes</h2>
      <p>We may update this privacy policy from time to time in order to reflect changes to our practices or for other operational, legal, or regulatory reasons.</p>

      <h2>6. Contact Us</h2>
      <p>For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by email at support@example.com.</p>
    </div>
  );
}
