#!/bin/bash
export HEADERS="{\"X-CHR-Client-ID\":\"e896dc02-56e8-4370-a97e-ace9d546da84\",\"Content-Type\":\"application/json\"}"
export NODE_TLS_REJECT_UNAUTHORIZED=0
export ENDPOINT=https://internal-api.ca.chr.dev:3000/internal-api/graphql
export PRIVATE_KEY_PATH=/Users/T961242/Downloads/internal-api/internal-api
export ALLOW_MUTATIONS=true
export NAME=chr
export SCHEMA=/Users/T961242/workspaces/mcp-graphql/chr-schema.graphql
npx /Users/T961242/workspaces/mcp-graphql/dist/index.js
