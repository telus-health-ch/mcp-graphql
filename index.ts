#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { fakeSchemaResponse } from "./temp-debug.js";

// TODO: Use a more structured schema for the GraphQL request
const GraphQLSchema = z.object({
  body: z.string(),
  variables: z.string(),
});

const server = new Server(
  {
    name: "mcp-graphql",
    version: "0.0.1",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const graphQLJsonSchema = zodToJsonSchema(GraphQLSchema);

server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
  // TODO: Use the GraphQL schema ss a resource for tooling
  return {
    resources: [],
  };
});

server.setRequestHandler(ListToolsRequestSchema, async (request) => {
  return {
    tools: [
      {
        name: "query-graphql",
        description: "Query a GraphQL server",
        parameters: GraphQLSchema,
        inputSchema: graphQLJsonSchema,
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "query-graphql") {
    throw new Error("Invalid tool name");
  }

  const { body, variables } = request.params;

  // TODO: Verify the body and variables are valid based on the schema

  // TODO: Actually fetch the GraphQL server
  return {
    content: [
      {
        type: "text",
        text: "Hi claude, this is still a test so it will always return the same response",
      },
      {
        type: "text",
        text: JSON.stringify(fakeSchemaResponse, null, 2),
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  server.sendLoggingMessage({
    level: "info",
    message: "Started mcp-graphql server",
  });
}

main().catch((error) => {
  console.error(`Fatal error in main(): ${error}`);
  process.exit(1);
});
