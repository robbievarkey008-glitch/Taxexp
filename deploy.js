const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env'));

let envVars = [];
for (const [key, value] of Object.entries(envConfig)) {
  // Escape commas and equals signs in the value for gcloud --set-env-vars
  let escapedValue = value.replace(/,/g, '\\,').replace(/=/g, '\\=');
  
  // Wrap in quotes if it contains spaces or newlines (like private keys)
  if (escapedValue.includes(' ') || escapedValue.includes('\n')) {
      // Actually, gcloud handles newlines in env vars very poorly if passed directly via CLI string.
      // A better approach is to create a .env.yaml file for gcloud run deploy!
  }
}
