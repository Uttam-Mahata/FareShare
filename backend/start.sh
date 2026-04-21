#!/bin/bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a
  . "$SCRIPT_DIR/.env"
  set +a
fi

: "${AZURE_SQL_URL:?AZURE_SQL_URL not set (copy backend/.env.example to backend/.env)}"
: "${AZURE_SQL_USER:?AZURE_SQL_USER not set}"
: "${AZURE_SQL_PASSWORD:?AZURE_SQL_PASSWORD not set}"
: "${JWT_SECRET:=$(openssl rand -base64 48)}"
: "${PORT:=8080}"

export AZURE_SQL_URL AZURE_SQL_USER AZURE_SQL_PASSWORD JWT_SECRET PORT

echo "Starting CommuteSplit backend on port $PORT..."
java -Xms256m -Xmx512m -jar "$SCRIPT_DIR/target/commute-split-backend-1.0.0.jar"
