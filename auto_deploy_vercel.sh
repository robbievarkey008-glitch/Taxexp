#!/bin/bash

# Extract variables from .env and push to Vercel
echo "Pushing environment variables to Vercel..."

while IFS='=' read -r key value; do
  # Skip comments and empty lines
  if [[ -z "$key" || "$key" == \#* ]]; then
    continue
  fi
  
  # Remove surrounding quotes from value if present
  value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//')
  
  echo "Adding $key to Vercel..."
  echo -n "$value" | npm_config_engine_strict=false npx --yes --engine-strict=false vercel env add "$key" production
done < .env

echo "Deploying to Vercel production..."
npm_config_engine_strict=false npx --yes --engine-strict=false vercel --prod --yes

echo "Deployment complete."
