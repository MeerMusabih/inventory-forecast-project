#!/bin/bash
set -e

echo "=== Installing Node.js dependencies ==="
npm install

echo "=== Generating frontend data ==="
node scripts/generate-direct.mjs

echo "=== Building React frontend ==="
npx vite build

echo "=== Installing Python dependencies ==="
cd backend
pip install -r requirements.txt

echo "=== Generating backend data ==="
python data/generator.py

cd ..
echo "=== Build complete ==="
