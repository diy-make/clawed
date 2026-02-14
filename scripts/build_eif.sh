#!/bin/bash
set -e

# Configuration
IMAGE_NAME="clawed-monster-proxy"
EIF_NAME="clawed-monster.eif"
WEBSITE_DIR="../website"

echo "🔱 Starting Clawed Monster EIF Build..."

# 1. Build Docker Image
echo "📦 Building Docker image: $IMAGE_NAME"
cd $WEBSITE_DIR
docker build -t $IMAGE_NAME .

# 2. Build EIF
echo "🧬 Converting Docker image to EIF: $EIF_NAME"
nitro-cli build-enclave --docker-uri $IMAGE_NAME:latest --output-file ../$EIF_NAME

echo "✔ EIF Build Complete: $EIF_NAME"

# 3. Output PCRs for TEE-04
echo "🔍 Enclave PCRs (Fingerprint):"
nitro-cli describe-enclaves | grep -A 5 "PCR" || echo "⚠ Run 'nitro-cli describe-eif --eif-path ../$EIF_NAME' to see PCRs."
