#!/bin/bash

echo "Starting Google Cloud Run Deployment..."
echo "This will package the app and deploy it securely to your GCP project (tax-exp-shopify)."

# Make sure we use the correct project
../google-cloud-sdk/bin/gcloud config set project tax-exp-shopify

# Enable the Cloud Run API just in case it isn't yet
../google-cloud-sdk/bin/gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Deploy the app to Cloud Run, injecting all environment variables from env.yaml
../google-cloud-sdk/bin/gcloud run deploy tax-exemption-manager \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --env-vars-file=env.yaml

echo ""
echo "Deployment Complete!"
echo "Please copy the final Service URL provided above."
