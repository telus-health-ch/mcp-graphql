#!/bin/bash
export HEADERS="{\"X-CHR-Client-ID\":\"e896dc02-56e8-4370-a97e-ace9d546da84\",\"Content-Type\":\"application/json\"}"
export NODE_TLS_REJECT_UNAUTHORIZED=0
export ENDPOINT=https://internal-api.ca.chr.dev:3000/internal-api/graphql
export ALLOW_MUTATIONS=true
export NAME=chr
export LOG_DIR=/Users/T961242/workspaces/mcp-graphql
export JWT_CONFIGURATION="{\"enabled\": true, \"private_key_path\": \"/Users/T961242/Downloads/internal-api/internal-api\"}"
#export SCHEMA=/Users/T961242/workspaces/mcp-graphql/chr-internal-api-schema.graphql

node /Users/T961242/workspaces/mcp-graphql/dist/index.js

# You can dump out the schema, and used the file as a cached version


#node /Users/T961242/workspaces/mcp-graphql/dist/dumpSchemaToFile.js

# Run the Model Context Protocol Inspector
#npx @modelcontextprotocol/inspector npx /Users/T961242/workspaces/mcp-graphql/dist/index.js