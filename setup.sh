#!/bin/bash
set -e

echo ""
echo "============================================"
echo "  Inventory Forecast & Predictive Analytics"
echo "  Setup Script"
echo "============================================"
echo ""

# Check Python
echo "Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python3 is not installed."
    echo "Install with: sudo apt install python3 python3-pip python3-venv"
    exit 1
fi
python3 --version
echo "[OK] Python3 found."

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed."
    echo "Install with: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs"
    exit 1
fi
node --version
echo "[OK] Node.js found."
echo ""

# Create Python virtual environment
echo "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate
echo "[OK] Virtual environment created and activated."

# Install Python packages
echo "Installing Python packages..."
cd backend
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install Python packages."
    exit 1
fi
cd ..
echo "[OK] Python packages installed."

# Generate backend data
echo "Generating backend data..."
cd backend
python3 data/generator.py
cd ..
echo "[OK] Backend data generated."

# Install npm packages
echo "Installing Node.js packages..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install Node.js packages."
    exit 1
fi
echo "[OK] Node.js packages installed."

# Generate frontend data
echo "Generating frontend data..."
node scripts/generate-static-data.mjs
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to generate frontend data."
    exit 1
fi
echo "[OK] Frontend data generated."

# Build frontend
echo "Building frontend..."
npx vite build
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to build frontend."
    exit 1
fi
echo "[OK] Frontend built."

echo ""
echo "============================================"
echo "  Setup Complete!"
echo "  Run: bash start.sh"
echo "============================================"
