#!/usr/bin/env bash
set -euo pipefail
if [ "$#" -ne 4 ]; then
  echo "Usage: ./scripts/configure-cluster.sh <node1-ip> <node2-ip> <node3-ip> <node4-ip>"
  echo "Use the actual addresses from hostname -I on each lab computer."
  exit 1
fi
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/backend/src/main/resources/application.properties"
cat > "$OUT" <<PROPS
spring.application.name=distributed-prime-api
server.port=8080
server.address=0.0.0.0
management.endpoints.web.exposure.include=health,info
cluster.node-count=4
cluster.node.1.host=$1
cluster.node.1.registry-port=1099
cluster.node.2.host=$2
cluster.node.2.registry-port=1099
cluster.node.3.host=$3
cluster.node.3.registry-port=1099
cluster.node.4.host=$4
cluster.node.4.registry-port=1099
PROPS
echo "Wrote node addresses to $OUT"
echo "Review the file before starting the API."
