#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/../frontend"
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js and npm are required. Install Node.js 20 LTS or newer, then rerun this script."
  exit 1
fi
if [ ! -d node_modules ]; then
  npm install
fi
npm run dev -- --host 0.0.0.0
