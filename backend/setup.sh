#!/bin/bash

# Setup script for PDF Matrix Backend
# This script installs LibreOffice and unoconv on Ubuntu/Debian systems

echo "🚀 Setting up PDF Matrix Backend..."

# Update package list
echo "📦 Updating package list..."
sudo apt-get update

# Install LibreOffice
echo "📝 Installing LibreOffice..."
sudo apt-get install -y libreoffice libreoffice-writer libreoffice-calc libreoffice-impress

# Install unoconv
echo "🔄 Installing unoconv..."
sudo apt-get install -y unoconv

# Install Python dependencies with uv
echo "🐍 Installing Python dependencies..."
if command -v uv &> /dev/null
then
    echo "Using uv to install dependencies..."
    uv sync
else
    echo "uv not found. Install it with: curl -LsSf https://astral.sh/uv/install.sh | sh"
    echo "Falling back to pip..."
    pip install -r requirements.txt
fi

# Verify installation
echo ""
echo "✅ Checking installation..."
echo ""

if command -v soffice &> /dev/null
then
    echo "✅ LibreOffice installed"
    soffice --version
else
    echo "❌ LibreOffice not found"
fi

if command -v unoconv &> /dev/null
then
    echo "✅ unoconv installed"
    unoconv --version
else
    echo "❌ unoconv not found"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the server, run:"
echo "  uv run uvicorn script:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "Or with uvicorn directly:"
echo "  uvicorn script:app --reload --host 0.0.0.0 --port 8000"
