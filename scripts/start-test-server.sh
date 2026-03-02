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
  # Ensure the OpenCode binary exists
  if [ ! -f ~/.opencode/bin/opencode ]; then
    echo "Error: ~/.opencode/bin/opencode not found. Install OpenCode on the host first."
    exit 1
  fi

  echo "Copying opencode binary to build context..."
  cp ~/.opencode/bin/opencode .

  echo "Building opencode-test Docker image..."
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

echo "Starting opencode-test-server on port 3000..."
docker run -d --name opencode-test-server \
  -p 3000:3000 \
  -v "$HOME/.local/share/opencode/auth.json:/root/.local/share/opencode/auth.json:ro" \
  opencode-test

echo "Mock OpenCode server is now running."
echo "- URL: http://localhost:3000"
echo "Logs can be viewed with: docker logs -f opencode-test-server"
