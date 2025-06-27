#!/bin/bash
export HEADERS="{\"Content-Type\":\"application/json\"}"
export NODE_TLS_REJECT_UNAUTHORIZED=0
export ENDPOINT=https://clinic2.ca.chr.dev:3000/external-api/graphql
export ALLOW_MUTATIONS=true
export NAME=chr
export LOG_DIR=/Users/T961242/workspaces/mcp-graphql
export JWT_CONFIGURATION="{\"enabled\": true, \"type\": \"external\", \"access_token\": \"eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIyIiwiYXVkIjoiaHR0cHM6Ly9jbGluaWMyLmNhLmNoci5kZXY6MzAwMC9leHRlcm5hbC1hcGkvZ3JhcGhxbCIsImlzcyI6Imh0dHBzOi8vY2xpbmljMi5jYS5jaHIuZGV2OjMwMDAiLCJleHAiOjIwNjY1Njk1NzIsImFwcF9uYW1lIjoicHJvdmlkZXJfbW9iaWxlX2FwcCIsImNsaWVudF9pZCI6IjY1YWU4MzM4LTE1NGYtNGNhNy05NjAzLTYwZDRlNmY4ZmZlMSJ9.gkUa1MSeH8gMp8nX2KfHoBW9hcvJFaQj8f-ycj_6F5UpebJEoxlBasOYiohHhPMlJGKpp_ZKkQvQs9sAWI8UMtZcpJmHRV0RY2O-O0Ey4QmismGqOOiiTKbuX1X8D3wB22fSfdn3ixpje067xPzUVNieKnUm5z7NITSAQhSOkOSeGDpSU9JqTmlAaqfv2xhuqqWjPWy63EnIrXDd-ZCibMy6jsGkmD1_I3Enm8IGatxXCW03S_9VUpTirR9kf4hlYX9l7zdhRlDq1hpQ6eXIWWfrAb3AlDeLW-dS5KmVufzGEqPWkIHJm585yNzlZx2PNVuchBexnhbAZbeU4dQkNQ\"}"
# export SCHEMA=/Users/T961242/workspaces/mcp-graphql/chr-external-api-schema.graphql
node /Users/T961242/workspaces/mcp-graphql/dist/index.js

# You can dump out the schema, and used the file as a cached version

# node /Users/T961242/workspaces/mcp-graphql/dist/dumpSchemaToFile.js

# Run the Model Context Protocol Inspector
#npx @modelcontextprotocol/inspector npx /Users/T961242/workspaces/mcp-graphql/dist/index.js


