#!/bin/bash
set -e

# Parse arguments
BUILD=true
if [[ "$1" == "--no-build" ]]; then
  BUILD=false
fi

# Change into the directory of this script
cd "$(dirname "$0")/docker"

if [ "$BUILD" = true ]; then
  echo "Building opencode-test Docker image (Mock Server)..."
  docker build -t opencode-test -f Dockerfile.test .
else
  echo "Skipping build (--no-build)..."
fi

# Stop existing container if it's running
if docker ps -a --format '{{.Names}}' | grep -q '^opencode-test-server$'; then
  echo "Stopping existing opencode-test-server container..."
  docker stop opencode-test-server || true
  docker rm opencode-test-server || true
fi

AUTH_FILE="$HOME/.local/share/opencode/auth.json"

echo "Starting opencode-test-server on port 3000..."
if [ -f "$AUTH_FILE" ]; then
	docker run -d --name opencode-test-server --network host \
		-v "$AUTH_FILE:/root/.local/share/opencode/auth.json:ro" \
		opencode-test
else
	docker run -d --name opencode-test-server --network host opencode-test
fi

echo "Mock OpenCode server is now running."
echo "- URL: http://localhost:3000"
echo "Logs can be viewed with: docker logs -f opencode-test-server"
