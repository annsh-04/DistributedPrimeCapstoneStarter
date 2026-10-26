#!/usr/bin/env bash
set -euo pipefail
if [ "$#" -lt 2 ]; then
  echo "Usage: ./scripts/start-node.sh <nodeId> <this-computer-ip> [registryPort]"
  exit 1
fi
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ID="$1"
IP="$2"
PORT="${3:-1099}"
if [ ! -d "$ROOT/backend/target/classes" ]; then
  echo "Backend classes are missing. First run: cd backend && mvn -DskipTests package"
  exit 1
fi
exec java -cp "$ROOT/backend/target/classes" com.capstone.cluster.rmi.NodeAgent "$ID" "$IP" "$PORT"
