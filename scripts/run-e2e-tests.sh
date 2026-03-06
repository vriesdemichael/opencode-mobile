#!/bin/bash
set -e

# Configuration
PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)
MAESTRO_DIR="$PROJECT_ROOT/maestro"
START_SERVER_SCRIPT="$PROJECT_ROOT/scripts/start-test-server.sh"
AUTH_FILE="$HOME/.local/share/opencode/auth.json"

# Ensure environment variables are set (optional, depends on environment)
export ANDROID_HOME=${ANDROID_HOME:-$HOME/Android/Sdk}
export PATH=$PATH:$ANDROID_HOME/platform-tools:$HOME/.maestro/bin

cd "$PROJECT_ROOT"

# Start test server will be handled later

# Core flows: UI-only, no AI completion required
CORE_FLOWS=("connection.yaml" "session-list.yaml" "chat.yaml" "chat-scroll.yaml")

# Authed flows: require live AI provider credentials (e.g. GitHub Copilot → zenmux)
# These are skipped in CI when auth.json is not available
AUTHED_FLOWS=("send-message.yaml")

# Check if auth credentials are available
HAS_AUTH=false
if [ -f "$AUTH_FILE" ]; then
    HAS_AUTH=true
fi

echo "Building Docker image for OpenCode test server..."
"$START_SERVER_SCRIPT"

# Determine which flows to run
FLOWS=("${CORE_FLOWS[@]}")
SKIPPED_FLOWS=()

if [ "$HAS_AUTH" = true ]; then
    FLOWS+=("${AUTHED_FLOWS[@]}")
else
    SKIPPED_FLOWS=("${AUTHED_FLOWS[@]}")
    echo ""
    echo "⚠️  Auth credentials not found at $AUTH_FILE"
    echo "   Skipping authed flows: ${AUTHED_FLOWS[*]}"
    echo "   These flows require GitHub Copilot auth for live AI completion."
    echo ""
fi

FAILED_FLOWS=()

for flow in "${FLOWS[@]}"; do
    echo "--------------------------------------------------"
    echo "Starting isolated test for: $flow"
    echo "--------------------------------------------------"
    
    # Restart the test server
    "$START_SERVER_SCRIPT" --no-build
    
    # Wait for server to be ready
    sleep 5
    
    # Clear device app state to avoid Maestro's buggy 'clearState: true' implementation
    echo "Clearing app state via ADB..."
    adb shell pm clear com.vriesdemichael.opencodemobile || true
    
    # Run the maestro test
    if ! maestro test --debug-output "$PROJECT_ROOT/.maestro/debug/${flow%.*}" --format junit --output report-${flow%.*}.xml "$MAESTRO_DIR/$flow"; then
        echo "Flow FAILED: $flow"
        FAILED_FLOWS+=("$flow")
        echo "Capturing manual failure screenshot using ADB..."
        mkdir -p "$PROJECT_ROOT/.maestro/screenshots"
        # Temporarily disable set -e to allow adb to fail without breaking the whole test suite
        set +e
        adb shell screencap -p "/data/local/tmp/failed-${flow%.*}.png"
        adb pull "/data/local/tmp/failed-${flow%.*}.png" "$PROJECT_ROOT/.maestro/screenshots/failed-${flow%.*}.png"
        adb shell rm "/data/local/tmp/failed-${flow%.*}.png"
        set -e
    else
        echo "Flow PASSED: $flow"
    fi
done

echo "--------------------------------------------------"
if [ ${#SKIPPED_FLOWS[@]} -gt 0 ]; then
    echo "SKIPPED (no auth): ${SKIPPED_FLOWS[*]}"
fi
if [ ${#FAILED_FLOWS[@]} -eq 0 ]; then
    echo "ALL TESTS PASSED! 🎉"
    exit 0
else
    echo "SOME TESTS FAILED: ${FAILED_FLOWS[*]}"
    exit 1
fi
