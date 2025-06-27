#!/bin/bash
export HEADERS="{\"Content-Type\":\"application/json\"}"
export NODE_TLS_REJECT_UNAUTHORIZED=0
export ENDPOINT=https://clinic2.ca.chr.dev:3000/public-api/graphql
export ALLOW_MUTATIONS=true
export NAME=chr
export LOG_DIR=/Users/T961242/workspaces/mcp-graphql
export JWT_CONFIGURATION="{\"enabled\": true, \"private_key_path\": \"/Users/T961242/Downloads/internal-api/internal-api\", \"iss\": \"ai\", \"algorithm\": \"RS512\"}"
# export SCHEMA=/Users/T961242/workspaces/mcp-graphql/chr-enterprise-api-schema.graphql

node /Users/T961242/workspaces/mcp-graphql/dist/index.js

# You can dump out the schema, and used the file as a cached version


# node /Users/T961242/workspaces/mcp-graphql/dist/dumpSchemaToFile.js

# Run the Model Context Protocol Inspector
#npx @modelcontextprotocol/inspector npx /Users/T961242/workspaces/mcp-graphql/dist/index.js