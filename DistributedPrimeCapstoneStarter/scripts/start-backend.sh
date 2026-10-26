#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"
if ! command -v mvn >/dev/null 2>&1; then
  echo "Maven is required. Ubuntu: sudo apt update && sudo apt install maven"
  exit 1
fi
mvn -DskipTests package
mvn spring-boot:run
