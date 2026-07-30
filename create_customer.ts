import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import fs from 'fs';

const envConfig = dotenv.parse(fs.readFileSync('.env'));

const app = initializeApp({
  credential: cert({
    projectId: envConfig.FIREBASE_PROJECT_ID,
    clientEmail: envConfig.FIREBASE_CLIENT_EMAIL,
    privateKey: envConfig.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore(app);

async function createCustomer() {
  const sessionsRef = db.collection('shopify_sessions');
  const snapshot = await sessionsRef.where('shop', '==', 'tax-exempt-dev.myshopify.com').get();
  
  if (snapshot.empty) {
    console.log("No session found for the shop!");
    return;
  }
  
  let accessToken = "";
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.accessToken) {
      accessToken = data.accessToken;
    }
  });
  
  if (!accessToken) {
    console.log("No access token found in session!");
    return;
  }

  const query = `
    mutation customerCreate($input: CustomerInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      firstName: "Test",
      lastName: "Customer",
      email: "test@example.com",
      password: "password123",
    }
  };

  const response = await fetch('https://tax-exempt-dev.myshopify.com/admin/api/2026-04/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ query, variables })
  });

  const result = await response.json();
  console.log(JSON.stringify(result, null, 2));
}

createCustomer().catch(console.error);
