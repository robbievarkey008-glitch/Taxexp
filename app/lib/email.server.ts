import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAdminNotification(
  toEmail: string,
  shop: string,
  jurisdiction: string,
  customerName: string
) {
  try {
    await resend.emails.send({
      from: "Tax Manager <onboarding@resend.dev>", // We use the resend test domain
      to: toEmail,
      subject: `New Tax Exemption Certificate - ${shop}`,
      html: `
        <h2>New Certificate Uploaded</h2>
        <p>A new tax exemption certificate was just uploaded for your review.</p>
        <ul>
          <li><strong>Shop:</strong> ${shop}</li>
          <li><strong>Customer:</strong> ${customerName}</li>
          <li><strong>Jurisdiction:</strong> ${jurisdiction}</li>
        </ul>
        <p>Log in to your Shopify Admin and open the Exemptify app to review it.</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send admin notification:", error);
  }
}

export async function sendCustomerNotification(
  toEmail: string,
  shopDomain: string,
  status: "APPROVED" | "REJECTED" | "REVOKED",
  rejectionReason?: string | null
) {
  try {
    let subject = "";
    let body = "";

    if (status === "APPROVED") {
      subject = `Your Tax Exemption Certificate was Approved`;
      body = `
        <h2>Tax Exemption Approved</h2>
        <p>Good news! Your tax exemption certificate for <strong>${shopDomain}</strong> has been reviewed and approved.</p>
        <p>Your account is now marked as tax-exempt for future purchases in the specified jurisdiction.</p>
      `;
    } else if (status === "REJECTED" || status === "REVOKED") {
      subject = `Your Tax Exemption Certificate was ${status === "REVOKED" ? "Revoked" : "Rejected"}`;
      body = `
        <h2>Tax Exemption ${status === "REVOKED" ? "Revoked" : "Rejected"}</h2>
        <p>Unfortunately, your tax exemption status for <strong>${shopDomain}</strong> has been ${status === "REVOKED" ? "revoked" : "rejected"}.</p>
        ${rejectionReason ? `<p><strong>Reason provided:</strong> ${rejectionReason}</p>` : ""}
        <p>Please contact the store if you believe this is an error or if you need to submit a new document.</p>
      `;
    }

    await resend.emails.send({
      from: "Tax Manager <onboarding@resend.dev>", // We use the resend test domain
      to: toEmail,
      subject,
      html: body,
    });
  } catch (error) {
    console.error("Failed to send customer notification:", error);
  }
}
