#!/bin/bash

# Script to copy WebViewer library files to public folder

echo "Copying WebViewer library files..."

# Check if node_modules exists
if [ ! -d "node_modules/@pdftron/webviewer" ]; then
  echo "Error: @pdftron/webviewer not found in node_modules"
  echo "Please run: npm install @pdftron/webviewer"
  exit 1
fi

# Create public/webviewer directory if it doesn't exist
mkdir -p public/webviewer

# Copy the public folder contents (core and ui)
cp -r node_modules/@pdftron/webviewer/public/* public/webviewer/

# Copy the main webviewer.min.js file
cp node_modules/@pdftron/webviewer/webviewer.min.js public/webviewer/

echo "WebViewer library files copied successfully to public/webviewer/"
echo "Files copied:"
echo "  - core/ directory"
echo "  - ui/ directory"
echo "  - webviewer.min.js"
echo ""
echo "You can now run the development server with: npm run dev"
