#!/bin/bash

# Build script for Foundry VTT Luck System module
# Automatically creates a properly structured ZIP file for distribution

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Module ID (must match module.json)
MODULE_ID="luck-system"

# Files to include in the distribution
FILES=(
    "module.json"
    "luck-system.js"
    "luck-system.css"
)

echo -e "${GREEN}Building Foundry VTT Luck System module...${NC}"

# Check if module.json exists
if [ ! -f "module.json" ]; then
    echo -e "${RED}Error: module.json not found!${NC}"
    echo "Make sure you run this script from the repository root."
    exit 1
fi

# Extract version from module.json
VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' module.json | grep -o '"[0-9.]*"' | tr -d '"')

if [ -z "$VERSION" ]; then
    echo -e "${RED}Error: Could not extract version from module.json${NC}"
    exit 1
fi

echo -e "Module ID: ${YELLOW}${MODULE_ID}${NC}"
echo -e "Version: ${YELLOW}${VERSION}${NC}"

# Output filename
OUTPUT_FILE="${MODULE_ID}-v${VERSION}.zip"

# Clean up any existing build artifacts
echo -e "\nCleaning up previous build artifacts..."
rm -rf temp-build
rm -f "$OUTPUT_FILE"

# Create build directory structure
echo -e "Creating build directory structure..."
mkdir -p "temp-build/${MODULE_ID}"

# Copy files to build directory
echo -e "Copying files..."
for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}Error: Required file '$file' not found!${NC}"
        rm -rf temp-build
        exit 1
    fi
    cp "$file" "temp-build/${MODULE_ID}/"
    echo -e "  ✓ ${file}"
done

# Create ZIP file
echo -e "\nCreating ZIP file: ${YELLOW}${OUTPUT_FILE}${NC}"
cd temp-build
zip -r "../${OUTPUT_FILE}" "${MODULE_ID}/" > /dev/null
cd ..

# Clean up temp directory
echo -e "Cleaning up temporary files..."
rm -rf temp-build

# Verify ZIP structure
echo -e "\n${GREEN}Build complete!${NC}"
echo -e "\nZIP contents:"
unzip -l "$OUTPUT_FILE"

# Show file size
FILE_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
echo -e "\nFile: ${YELLOW}${OUTPUT_FILE}${NC}"
echo -e "Size: ${YELLOW}${FILE_SIZE}${NC}"

# Success message
echo -e "\n${GREEN}✓ Successfully built ${OUTPUT_FILE}${NC}"
echo -e "\nNext steps:"
echo -e "  1. Test the ZIP file locally"
echo -e "  2. Create git tag: ${YELLOW}git tag v${VERSION}${NC}"
echo -e "  3. Push tag: ${YELLOW}git push origin v${VERSION}${NC}"
echo -e "  4. Create GitHub release and upload ${YELLOW}${OUTPUT_FILE}${NC}"
