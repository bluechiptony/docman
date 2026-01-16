#!/bin/bash

# Deploy script for DocMan web application
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh dev

set -e

ENVIRONMENT=${1:-dev}
DOCKER_USERNAME=${DOCKER_USERNAME:-"your-dockerhub-username"}
IMAGE_NAME="docman-web"
CONTAINER_NAME="docman-web-${ENVIRONMENT}"

echo "🚀 Starting deployment for environment: $ENVIRONMENT"

# Pull the latest image
echo "📦 Pulling latest Docker image..."
docker pull ${DOCKER_USERNAME}/${IMAGE_NAME}:${ENVIRONMENT}-latest

# Stop and remove existing container
echo "🛑 Stopping existing container..."
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm ${CONTAINER_NAME} 2>/dev/null || true

# Run the new container
echo "▶️  Starting new container..."
docker run -d \
  --name ${CONTAINER_NAME} \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file /opt/docman/.env.${ENVIRONMENT} \
  --network docman-network \
  ${DOCKER_USERNAME}/${IMAGE_NAME}:${ENVIRONMENT}-latest

# Clean up old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment complete!"
echo "📊 Container status:"
docker ps | grep ${CONTAINER_NAME}
