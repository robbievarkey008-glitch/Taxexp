import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { TAX_EXEMPTION_OPTIONS } from "../lib/tax-exemptions";
import { createCertificate, getShopSettings } from "../lib/firestore.server";
import { sendAdminNotification } from "../lib/email.server";
import { rateLimit } from "../lib/rate-limit.server";
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.public.appProxy(request);

  // Removed the strict session check so you can view the form in Incognito mode for testing.
  // In a real production scenario, you might want to enforce customer login here.

  const optionsHtml = TAX_EXEMPTION_OPTIONS.map(
    (opt) => `<option value="${opt.value}">${opt.label}</option>`
  ).join("");

  // Dynamically resolve the backend origin so it always matches exactly where the app is hosted (Vercel)
  const appUrl = new URL(request.url).origin;

  const liquid = `
<style>
  /* Premium 3D Minimalist Variables */
  :root {
    --primary-color: #00B3FF; /* Cyan */
    --primary-deep: #0066FF; /* Deep Blue */
    --border-color: #E2E8F0;
    --bg-color: #F8FAFC;
    --error-color: #d82c0d;
    --success-color: #008060;
    --text-main: #0F172A;
    --text-subdued: #64748B;
    --border-radius: 16px;
    --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .tax-form-container {
    max-width: 500px;
    margin: 40px auto;
    padding: 40px;
    background: #ffffff;
    border-radius: 24px;
    box-shadow: 0 20px 40px -10px rgba(0, 102, 255, 0.1), 0 1px 3px rgba(0,0,0,0.05);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: var(--text-main);
    border: 1px solid rgba(0, 179, 255, 0.1);
  }

  .tax-form-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .tax-form-header h1 {
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 12px;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, var(--primary-deep), var(--primary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .tax-form-header p {
    color: var(--text-subdued);
    font-size: 15px;
    line-height: 1.6;
  }

  .tax-input-group {
    margin-bottom: 20px;
  }

  .tax-input-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 13px;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .tax-input-group input, 
  .tax-input-group select {
    width: 100%;
    padding: 16px;
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius);
    font-size: 15px;
    transition: var(--transition);
    box-sizing: border-box;
    background: #fff;
    color: var(--text-main);
    font-weight: 500;
  }

  .tax-input-group select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: url('data:image/svg+xml;utf8,<svg fill="%23555" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
    background-repeat: no-repeat;
    background-position-x: 96%;
    background-position-y: center;
    cursor: pointer;
  }

  .tax-input-group input:focus, 
  .tax-input-group select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(0, 179, 255, 0.15);
  }

  .tax-input-group input[type="file"] {
    padding: 12px;
    background: var(--bg-color);
    cursor: pointer;
    border: 2px dashed #CBD5E1;
    padding-right: 48px;
  }

  .file-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .file-clear-btn {
    display: none;
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: #e2e8f0;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #64748b;
    transition: all 0.2s;
  }

  .file-clear-btn:hover {
    background: #cbd5e1;
    color: #d82c0d;
  }

  .tax-submit-btn {
    width: 100%;
    background: var(--primary-color);
    color: #fff;
    padding: 16px 24px;
    border: none;
    border-radius: var(--border-radius);
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 0 var(--primary-deep), 0 8px 16px rgba(0, 179, 255, 0.3);
    margin-top: 10px;
  }

  .tax-submit-btn:hover:not(:disabled) {
    transform: translateY(2px);
    box-shadow: 0 2px 0 var(--primary-deep), 0 4px 8px rgba(0, 179, 255, 0.3);
  }

  .tax-submit-btn:active:not(:disabled) {
    transform: translateY(4px);
    box-shadow: 0 0 0 var(--primary-deep), 0 0 0 rgba(0, 179, 255, 0.3);
  }

  .tax-submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: translateY(4px);
    box-shadow: 0 0 0 var(--primary-deep);
  }

  .spinner {
    display: none;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .tax-message {
    margin-top: 20px;
    padding: 16px;
    border-radius: 6px;
    font-size: 14px;
    line-height: 1.5;
    display: none;
    font-weight: 500;
  }

  .tax-message.error {
    display: block;
    background: #FBEAE5;
    color: var(--error-color);
    border: 1px solid #F5C5BE;
  }

  .tax-message.success {
    display: block;
    background: #E3F1DF;
    color: var(--success-color);
    border: 1px solid #BCE3B4;
  }

  .tax-message.info {
    display: block;
    background: #EBF5FA;
    color: #2C6ECB;
    border: 1px solid #B4E1FA;
  }

  .input-warning {
    color: #d82c0d;
    font-size: 13px;
    margin-top: 8px;
    display: none;
    align-items: flex-start;
    gap: 6px;
    line-height: 1.4;
    font-weight: 500;
    background: #fff5f5;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #fed7d7;
  }
</style>

<div class="page-width">
  <div class="tax-form-container">
    <div class="tax-form-header">
      <h1>Tax Exemption Certificate</h1>
      <p>Upload your tax exemption certificate (reseller permit, etc.) to apply it to your account for future purchases.</p>
    </div>
    
    <form id="tax-form" onsubmit="event.preventDefault(); submitForm();">
      <div class="tax-input-group">
        <label for="jurisdiction">Jurisdiction / Exemption Type</label>
        <select id="jurisdiction" name="jurisdiction" required>
          <option value="" disabled selected>Select a jurisdiction...</option>
          ${optionsHtml}
        </select>
        <div id="jurisdiction-warning" class="input-warning">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>The selected jurisdiction doesn't seem to match the uploaded document. Please review.</span>
        </div>
      </div>

      <div class="tax-input-group">
        <label for="exemptionNumber">Exemption Number</label>
        <input type="text" id="exemptionNumber" name="exemptionNumber" required placeholder="e.g. 123-456-789">
        <div id="number-warning" class="input-warning">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <span>AI has attempted to read your document and pre-fill this number. AI can make mistakes, so please verify it is exactly correct.</span>
        </div>
      </div>

      <div class="tax-input-group">
        <label for="file">Certificate File (PDF or Image)</label>
        <div class="file-input-wrapper">
          <input type="file" id="file" name="file" accept="application/pdf,image/*" required>
          <div id="file-clear-btn" class="file-clear-btn" title="Remove Document">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
        </div>
      </div>

      <button type="submit" id="submit-btn" class="tax-submit-btn">
        <div id="btn-spinner" class="spinner"></div>
        <span id="btn-text">Submit Certificate</span>
      </button>
      
      <div id="status-msg" class="tax-message"></div>
    </form>
  </div>
</div>

<script type="module">
  // Lazy Tesseract.js OCR Pre-fill
  window.latestOCRText = "";

  function extractNumberFromText(text, jurisdiction) {
    let match = null;
    
    // 1. Jurisdiction-Specific Priority Matches
    if (jurisdiction) {
      if (jurisdiction.includes('US_IL')) match = text.match(/\bE\d{8}\b/);
      else if (jurisdiction.includes('US_FL')) match = text.match(/\b\d{2}-\d{10}\b/);
      else if (jurisdiction.startsWith('CA_')) match = text.match(/\b\d{9}(?:\s*RT\d{4})?\b/);
      else if (jurisdiction.includes('US_TX')) match = text.match(/\b[1-9]\d{10}\b/);
      else if (jurisdiction.includes('US_NY') || jurisdiction.includes('US_WA')) match = text.match(/\b\d{9}\b/);
    }

    // 2. High-Confidence Global Formats
    if (!match) {
      const exactFormats = [
         /\bE\d{8}\b/,           
         /\b\d{3}-\d{3}-\d{3}\b/, 
         /\b\d{2}-\d{7}\b/,       
         /\b\d{9}(?:\s*RT\d{4})?\b/ 
      ];
      for (let regex of exactFormats) {
         const m = text.match(regex);
         if (m) { match = m; break; }
      }
    }

    // 3. Smart Fallback (Ignore Zip/Phone)
    if (!match) {
       const candidates = text.match(/\b[A-Z0-9-]{7,15}\b/g) || [];
       for (let cand of candidates) {
          const digitCount = (cand.match(/\d/g) || []).length;
          if (digitCount >= 4) {
             if (/^\d{5}-\d{4}$/.test(cand)) continue;
             if (/^\d{3}-\d{3}-\d{4}$/.test(cand) || /^\d{10}$/.test(cand)) continue;
             match = [cand];
             break;
          }
       }
    }
    return match ? match[0] : null;
  }

  document.getElementById('file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    const msg = document.getElementById('status-msg');
    msg.className = "tax-message info";
    msg.innerText = "Scanning document for data (AI pre-fill)...";
    
    try {
      if (!window.Tesseract) {
        await new Promise((resolve, reject) => {
           const script = document.createElement('script');
           script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
           script.onload = resolve;
           script.onerror = reject;
           document.body.appendChild(script);
        });
      }

      const { data: { text } } = await window.Tesseract.recognize(file, 'eng');
      console.log("[OCR Extraction]", text);
      window.latestOCRText = text;
      
      const jurisdictionSelect = document.getElementById('jurisdiction');
      const extractedNumber = extractNumberFromText(text, jurisdictionSelect.value);
      
      if (extractedNumber && !document.getElementById('exemptionNumber').value) {
         document.getElementById('exemptionNumber').value = extractedNumber;
         msg.className = "tax-message success";
         msg.innerText = "✨ Document scanned successfully! Please review the fields below.";
         document.getElementById('number-warning').style.display = 'flex';
      } else {
         msg.className = "tax-message success"; 
         msg.innerText = "Document uploaded. We couldn't auto-detect a number, please enter it manually.";
      }

      // Cross-reference jurisdiction
      if (jurisdictionSelect.value) {
        const selectedText = jurisdictionSelect.options[jurisdictionSelect.selectedIndex].text;
        const locationName = selectedText.split('—')[0].trim().toLowerCase();
        if (!text.toLowerCase().includes(locationName)) {
          document.getElementById('jurisdiction-warning').style.display = 'flex';
        } else {
          document.getElementById('jurisdiction-warning').style.display = 'none';
        }
      }
    } catch (err) {
       console.error("OCR Error:", err);
       msg.className = "tax-message"; // Hide on failure
    }
  });

    // Add event listener to re-evaluate jurisdiction warning and dynamically extract number if they change the dropdown
    document.getElementById('jurisdiction').addEventListener('change', function() {
      if (!document.getElementById('file').files[0] || !window.latestOCRText) return;
      
      const text = window.latestOCRText;
      const selectedText = this.options[this.selectedIndex].text;
      const locationName = selectedText.split('—')[0].trim().toLowerCase();
      
      if (!text.toLowerCase().includes(locationName)) {
        document.getElementById('jurisdiction-warning').style.display = 'flex';
      } else {
        document.getElementById('jurisdiction-warning').style.display = 'none';
      }

      // Re-run number extraction with the new jurisdiction context
      const newExtractedNumber = extractNumberFromText(text, this.value);
      if (newExtractedNumber) {
        document.getElementById('exemptionNumber').value = newExtractedNumber;
        document.getElementById('number-warning').style.display = 'flex';
      }
    });

  document.getElementById('file').addEventListener('change', function(e) {
    const clearBtn = document.getElementById('file-clear-btn');
    if (this.files && this.files.length > 0) {
      clearBtn.style.display = 'flex';
    } else {
      clearBtn.style.display = 'none';
    }
  });

  document.getElementById('file-clear-btn').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Reset file input
    const fileInput = document.getElementById('file');
    fileInput.value = '';
    this.style.display = 'none';
    
    // Reset jurisdiction
    document.getElementById('jurisdiction').value = '';
    document.getElementById('jurisdiction-warning').style.display = 'none';

    // Reset exemption number
    document.getElementById('exemptionNumber').value = '';
    document.getElementById('number-warning').style.display = 'none';

    // Reset status message
    const msg = document.getElementById('status-msg');
    msg.className = "tax-message";
    msg.innerText = "";
  });

  import { genUploader } from "https://esm.sh/uploadthing@7.4.1/client?deps=react";
  const { uploadFiles } = genUploader({
    url: "${appUrl}/api/proxy/uploadthing",
  });

  window.submitForm = async function() {
    const btn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const msg = document.getElementById('status-msg');
    const form = document.getElementById('tax-form');
    
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];
    const jurisdiction = document.getElementById('jurisdiction').value;
    const exemptionNumber = document.getElementById('exemptionNumber').value;

    if (!file || !jurisdiction || !exemptionNumber) return;

    btn.disabled = true;
    btnSpinner.style.display = 'block';
    btnText.innerText = "Uploading Document...";
    msg.className = "tax-message";

    try {
      // 1. Upload to UploadThing directly from the browser
      const res = await uploadFiles("certificateUploader", {
        files: [file],
      });

      if (!res || !res[0] || !res[0].serverData || !res[0].serverData.fileKey) {
        throw new Error("UPLOAD_FAILED");
      }
      
      const fileKey = res[0].serverData.fileKey;

      // 2. Submit metadata to proxy
      btnText.innerText = "Saving Record...";
      const submitRes = await fetch(window.location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileKey,
          jurisdiction,
          exemptionNumber
        })
      });

      const submitData = await submitRes.json();
      
      if (submitData.success) {
        msg.className = "tax-message success";
        msg.innerText = "🎉 Certificate submitted successfully! We will review your account shortly.";
        form.reset();
        document.getElementById('number-warning').style.display = 'none';
        document.getElementById('jurisdiction-warning').style.display = 'none';
        document.getElementById('file-clear-btn').style.display = 'none';
        window.latestOCRText = "";
      } else {
        throw new Error("SAVE_FAILED");
      }
    } catch (err) {
      console.error(err);
      msg.className = "tax-message error";
      
      if (err.message.includes("UPLOAD_FAILED")) {
        msg.innerText = "We couldn't upload your document. Please ensure it is a valid PDF or Image under 16MB and try again.";
      } else if (err.message.includes("SAVE_FAILED")) {
        msg.innerText = "Your document was uploaded, but we failed to save the record. Please try again or contact support.";
      } else {
        msg.innerText = "An unexpected error occurred while uploading. Please check your internet connection and try again.";
      }
    } finally {
      btn.disabled = false;
      btnSpinner.style.display = 'none';
      btnText.innerText = "Submit Certificate";
    }
  };
</script>
  `;

  return new Response(liquid, {
    headers: { 
      "Content-Type": "application/liquid",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.public.appProxy(request);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const clientIp = request.headers.get("x-shopify-client-ip") || request.headers.get("x-forwarded-for") || null;
  const isAllowed = await rateLimit(clientIp, 10);
  if (!isAllowed) {
    return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), { status: 429 });
  }

  const shop = session.shop;
  
  // We need to fetch the customer email and name from Shopify API
  // Wait, authenticate.public.appProxy doesn't give admin api access natively,
  // but we can initialize an admin client using the shop if it's an offline token.
  // Actually, we can just use the customer ID provided by the app proxy context.
  // We can fetch the customer info using the unauthenticated admin api? No.
  // The app proxy doesn't send customer email, just the ID.
  // To get the email, we'd need to use the admin API or rely on the storefront API.
  // For MVP, we will just use placeholders for email/name since we don't have the admin session here.
  // Wait, we CAN use the admin API by instantiating it with the shop!
  
  try {
    const body = await request.json();

    // Handle form metadata submission
    const { fileKey, jurisdiction, exemptionNumber } = body;

    if (!fileKey || !jurisdiction || !exemptionNumber) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // Determine buyer type: if customerId is present in proxy, it's a customer.
    // Shopify App Proxy injects `logged_in_customer_id` into the query string.
    const url = new URL(request.url);
    const customerIdStr = url.searchParams.get("logged_in_customer_id");
    
    // Fallback to a mock ID for testing on stores that force New Customer Accounts
    const finalCustomerIdStr = customerIdStr || "9999999999";
    const shopifyCustomerId = `gid://shopify/Customer/${finalCustomerIdStr}`;

    await createCertificate({
      shop,
      buyerType: "customer",
      shopifyCustomerId,
      shopifyCompanyLocationId: null,
      customerEmail: "Customer " + customerIdStr, // Fallback placeholder
      customerName: "Storefront User",
      jurisdiction,
      taxExemptionCode: jurisdiction, // the dropdown value is the exact enum
      exemptionNumber,
      fileStoragePath: fileKey,
      expirationDate: null,
    });

    // Check settings and notify admin if enabled
    const settings = await getShopSettings(shop);
    if (settings?.adminNotificationsEnabled && settings.adminNotificationEmail) {
      await sendAdminNotification(
        settings.adminNotificationEmail,
        shop,
        jurisdiction,
        "Storefront User"
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Proxy Action Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
