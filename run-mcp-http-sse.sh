#!/bin/bash
export HEADERS="{\"X-CHR-Client-ID\":\"e896dc02-56e8-4370-a97e-ace9d546da84\",\"Content-Type\":\"application/json\"}"
export NODE_TLS_REJECT_UNAUTHORIZED=0
export ENDPOINT=https://internal-api.ca.chr.dev:3000/internal-api/graphql
export PRIVATE_KEY_PATH=/Users/T961242/Downloads/internal-api/internal-api
export ALLOW_MUTATIONS=true
export NAME=chr
export LOG_DIR=/Users/T961242/workspaces/mcp-graphql
export PORT=5900
export JWT_CONFIGURATION="{\"enabled\": true, \"private_key_path\": \"/Users/T961242/Downloads/internal-api/internal-api\"}"

#export SCHEMA=/Users/T961242/workspaces/mcp-graphql/chr-internal-api-schema.graphql


# Build the server if not already built
if [ ! -f "$(dirname "$0")/dist/server.js" ]; then
  echo "Building server..."
  npm run build:server
fi

# Run the server
node "$(dirname "$0")/dist/server.js"

# Run the Model Context Protocol Inspector
#npx @modelcontextprotocol/inspector