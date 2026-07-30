import { TAX_EXEMPTION_OPTIONS } from "./app/lib/tax-exemptions";
import fs from "fs";

const optionsHtml = TAX_EXEMPTION_OPTIONS.map(
  (opt) => `          <option value="${opt.value}">${opt.label}</option>`
).join("\n");

const liquid = `
{% if customer %}
  <style>
    /* Premium CSS Reset and Variables */
    :root {
      --primary-color: {{ block.settings.primary_color }};
      --primary-hover: #333;
      --border-color: #dfe3e8;
      --bg-color: {{ block.settings.bg_color }};
      --error-color: #d82c0d;
      --success-color: #008060;
      --text-main: #212b36;
      --text-subdued: #637381;
      --border-radius: 8px;
      --transition: all 0.2s ease-in-out;
    }
    
    .tax-form-container {
      max-width: 600px;
      margin: 40px auto;
      padding: 30px;
      background: var(--bg-color);
      border-radius: var(--border-radius);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: var(--text-main);
    }

    .tax-form-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .tax-form-header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .tax-form-header p {
      color: var(--text-subdued);
      font-size: 15px;
      line-height: 1.5;
    }

    .tax-input-group {
      margin-bottom: 24px;
    }

    .tax-input-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .tax-input-group input, 
    .tax-input-group select {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 15px;
      transition: var(--transition);
      box-sizing: border-box;
      background: #fff;
    }

    .tax-input-group input:focus, 
    .tax-input-group select:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
    }

    .tax-input-group input[type="file"] {
      padding: 10px;
      background: var(--bg-color);
      cursor: pointer;
    }

    .tax-submit-btn {
      width: 100%;
      background: var(--primary-color);
      color: #fff;
      padding: 14px 24px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }

    .tax-submit-btn:hover:not(:disabled) {
      background: var(--primary-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }

    .tax-submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
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
  </style>

  <div class="page-width">
    <div class="tax-form-container">
      <div class="tax-form-header">
        <h1>{{ block.settings.title }}</h1>
        <p>{{ block.settings.subtitle }}</p>
      </div>
      
      <form id="tax-form" onsubmit="event.preventDefault(); submitForm();">
        <div class="tax-input-group">
          <label for="jurisdiction">Jurisdiction / Exemption Type</label>
          <select id="jurisdiction" name="jurisdiction" required>
            <option value="" disabled selected>Select a jurisdiction...</option>
${optionsHtml}
          </select>
        </div>

        <div class="tax-input-group">
          <label for="exemptionNumber">Exemption Number</label>
          <input type="text" id="exemptionNumber" name="exemptionNumber" required placeholder="e.g. 123-456-789">
        </div>

        <div class="tax-input-group">
          <label for="file">Certificate File (PDF or Image)</label>
          <input type="file" id="file" name="file" accept="application/pdf,image/*" required>
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
    import { genUploader } from "https://esm.sh/uploadthing@7.7.4/client?v=4";

    const { uploadFiles } = genUploader({
      url: "/apps/tax-exemptions/uploadthing",
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
        const res = await uploadFiles("certificateUploader", {
          files: [file],
        });

        if (!res || res.length === 0) throw new Error("UPLOAD_FAILED");
        const fileKey = res[0].key;

        btnText.innerText = "Saving Record...";
        
        // Include logged_in_customer_id explicitly since App Blocks don't automatically append it like App Proxies
        const submitRes = await fetch("/apps/tax-exemptions?logged_in_customer_id={{ customer.id }}", {
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
        } else {
          throw new Error("SAVE_FAILED");
        }
      } catch (err) {
        console.error(err);
        msg.className = "tax-message error";
        
        if (err.message.includes("UPLOAD_FAILED") || err.message.includes("Invalid input")) {
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
        const numMatch = text.match(/\\b[A-Z0-9-]{7,15}\\b/);
        
        if (numMatch && !document.getElementById('exemptionNumber').value) {
           document.getElementById('exemptionNumber').value = numMatch[0];
           msg.className = "tax-message success";
           msg.innerText = "✨ Form pre-filled automatically! Please review the exemption number.";
        } else {
           msg.className = "tax-message"; 
        }
      } catch (err) {
         console.error("OCR Error:", err);
         msg.className = "tax-message"; 
      }
    });
  </script>
{% else %}
  <div class="page-width" style="text-align: center; padding: 40px; background: #fff; margin: 20px auto; border-radius: 8px;">
    <h2>Tax Exemption Manager</h2>
    <p>Please <a href="{{ routes.account_login_url }}">log in</a> to your account to upload a tax exemption certificate.</p>
  </div>
{% endif %}

{% schema %}
{
  "name": "Tax Exemption Form",
  "target": "section",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Form Title",
      "default": "Tax Exemption Certificate"
    },
    {
      "type": "text",
      "id": "subtitle",
      "label": "Form Subtitle",
      "default": "Upload your tax exemption certificate (reseller permit, etc.) to apply it to your account for future purchases."
    },
    {
      "type": "color",
      "id": "primary_color",
      "label": "Primary Button Color",
      "default": "#000000"
    },
    {
      "type": "color",
      "id": "bg_color",
      "label": "Container Background Color",
      "default": "#ffffff"
    }
  ]
}
{% endschema %}
`;

fs.writeFileSync("extensions/tax-form-block/blocks/tax-form.liquid", liquid);
