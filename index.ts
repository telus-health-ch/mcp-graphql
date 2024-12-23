#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { fakeSchemaResponse } from "./_debug/fake-schema.js";

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
      logging: {},
      tools: {},
      resources: {
        template: true,
        read: true,
      },
    },
  }
);

const graphQLJsonSchema = zodToJsonSchema(GraphQLSchema);

server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
  try {
    // Create a secure temporary directory with a prefix
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "graphql-"));
    const tempFilePath = path.join(tempDir, "schema.json");

    // Write the schema file in the temp directory
    fs.writeFileSync(
      tempFilePath,
      JSON.stringify(fakeSchemaResponse, null, 2),
      {
        mode: 0o644, // Read/write for owner, read for others
      }
    );

    // Log the created file path for debugging
    server.sendLoggingMessage({
      level: "debug",
      message: `Created temporary schema file at: ${tempFilePath}`,
    });

    return {
      resources: [
        {
          name: "graphql-schema",
          mimeType: "application/json",
          description: "The GraphQL schema of the server",
          uri: new URL(`file://${tempFilePath}`).href,
        },
      ],
    };
  } catch (error) {
    server.sendLoggingMessage({
      level: "error",
      message: `Failed to create temporary file: ${error}`,
    });
    return {
      resources: [],
    };
  }
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  server.sendLoggingMessage({
    level: "debug",
    message: `ReadResourceRequestSchema: ${JSON.stringify(request, null, 2)}`,
  });

  const uri = new URL(request.params.uri);

  let fileContent = "";
  try {
    fileContent = fs.readFileSync(uri.pathname, "utf8");
  } catch (error) {
    server.sendLoggingMessage({
      level: "error",
      message: `Failed to read file: ${error}`,
    });
  } finally {
    fs.unlinkSync(uri.pathname);
  }

  return {
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: fileContent,
      },
    ],
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
