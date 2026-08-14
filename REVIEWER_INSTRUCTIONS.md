# Shopify App Review: Sample Test Credentials & Document

**UPDATE:** Thank you for bringing the upload error to our attention! We have identified and patched a bug in our proxy routing architecture that was causing the file upload to fail on the storefront. The fix is now live in production, and the storefront upload will now work perfectly.

### 📄 Sample Document
**[Download Sample Tax Exemption Certificate PDF](https://raw.githubusercontent.com/robbievarkey008-glitch/Taxexp/main/public/sample_tax_exemption_cert.pdf)**

### 🧪 How to test the storefront upload:
1. Go to your test store's storefront.
2. Navigate to the pages where the **Exemptify** tax form is embedded.
3. Download the sample certificate PDF from the link above.
4. Upload the PDF into the file picker on the form.
5. Select **California** as the jurisdiction.
6. Enter **CA-78234** as the exemption number.
7. Click **Submit**.

The certificate will upload successfully and a confirmation message will appear. This is a standard California Sales Tax Exemption Certificate (Resale type), which is the most common document type our app handles. Thank you for your time and review!
