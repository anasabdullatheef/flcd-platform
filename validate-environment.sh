#!/bin/bash
# Environment Validation Script for FLCD Platform
# Checks if all dependencies are properly installed and configured

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_command() {
    if command -v "$1" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is not installed"
        return 1
    fi
}

check_version() {
    local cmd=$1
    local min_version=$2
    local current_version=$($cmd --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -1)
    
    if [ -n "$current_version" ]; then
        echo -e "${GREEN}✓${NC} $cmd version: $current_version"
    else
        echo -e "${YELLOW}?${NC} $cmd version: unknown"
    fi
}

echo "FLCD Platform Environment Validation"
echo "====================================="

# Check required commands
REQUIRED_COMMANDS=("node" "npm" "psql" "git")
ALL_GOOD=true

for cmd in "${REQUIRED_COMMANDS[@]}"; do
    if ! check_command "$cmd"; then
        ALL_GOOD=false
    fi
done

# Check versions
check_version "node" "18.0.0"
check_version "npm" "8.0.0"

# Check project structure
echo ""
echo "Project Structure:"
for dir in "flcd-backend" "flcd-frontend"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir directory exists"
    else
        echo -e "${RED}✗${NC} $dir directory missing"
        ALL_GOOD=false
    fi
done

# Check package files
echo ""
echo "Package Files:"
for file in "flcd-backend/package.json" "flcd-frontend/package.json"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file missing"
        ALL_GOOD=false
    fi
done

echo ""
if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}Environment validation passed!${NC}"
    exit 0
else
    echo -e "${RED}Environment validation failed. Please fix the issues above.${NC}"
    exit 1
fi
