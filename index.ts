#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

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

server.setRequestHandler(ListToolsRequestSchema, async (request) => {
  return {
    tools: [
      {
        name: "graphql",
        description: "Query a GraphQL server",
        parameters: GraphQLSchema,
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "graphql") {
    throw new Error("Invalid tool name");
  }

  const { body, variables } = request.params;

  // TODO: Implement the GraphQL request

  return {
    result: "success",
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.info("Started mcp-graphql server");
}

main().catch((error) => {
  console.error(`Fatal error in main(): ${error}`);
  process.exit(1);
});
