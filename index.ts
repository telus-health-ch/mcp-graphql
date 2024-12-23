#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { introspectionQuery } from "./helpers/introspection-query.js";

// TODO: Use a more structured schema for GraphQL requests possibly?
const GraphQLSchema = z.object({
  query: z.string(),
  variables: z.string().optional(),
});

const ConfigSchema = z.object({
  endpoint: z.string().url().default("http://localhost:4000/graphql"),
  headers: z.record(z.string()).default({}),
});

type Config = z.infer<typeof ConfigSchema>;

type GraphQLRequest = z.infer<typeof GraphQLSchema>;

function parseArgs(): Config {
  const argv = yargs(hideBin(process.argv))
    .option("endpoint", {
      type: "string",
      description: "GraphQL endpoint URL",
      default: "http://localhost:4000/graphql",
    })
    .option("headers", {
      type: "string",
      description: "JSON string of headers to send with requests",
      default: "{}",
    })
    .help()
    .parseSync();

  try {
    return ConfigSchema.parse({
      endpoint: argv.endpoint,
      headers: typeof argv.headers === "string" ? JSON.parse(argv.headers) : {},
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Invalid configuration:");
      console.error(
        error.errors
          .map((e) => `  ${e.path.join(".")}: ${e.message}`)
          .join("\n")
      );
    } else {
      console.error("Error parsing arguments:", error);
    }
    process.exit(1);
  }
}

const config = parseArgs();

const server = new Server(
  {
    name: "mcp-graphql",
    version: "0.0.1",
    description: `GraphQL client for ${config.endpoint}`,
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
  return {
    resources: [
      {
        name: "graphql-schema",
        mimeType: "application/json",
        description: "The GraphQL schema of the server",
        uri: new URL(config.endpoint).href,
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  server.sendLoggingMessage({
    level: "debug",
    message: `ReadResourceRequestSchema: ${JSON.stringify(request, null, 2)}`,
  });

  try {
    const response = await fetch(request.params.uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: JSON.stringify({
        query: introspectionQuery,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const schemaData = await response.json();

    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify(schemaData, null, 2),
        },
      ],
    };
  } catch (error) {
    server.sendLoggingMessage({
      level: "error",
      message: `Failed to fetch GraphQL schema: ${error}`,
    });
    throw new Error(`Failed to fetch GraphQL schema: ${error}`);
  }
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

  const { query, variables } = request.params.arguments ?? {};

  server.sendLoggingMessage({
    level: "info",
    message: `Calling query-graphql tool with body: ${query} and variables: ${variables}`,
  });

  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors && data.errors.length > 0) {
      // Contains GraphQL errors
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `The GraphQL response has errors, please fix the query: ${JSON.stringify(
              data,
              null,
              2
            )}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  } catch (error) {
    server.sendLoggingMessage({
      level: "error",
      message: `Failed to execute GraphQL query: ${error}`,
    });
    throw new Error(`Failed to execute GraphQL query: ${error}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  server.sendLoggingMessage({
    level: "info",
    message: `Started mcp-graphql server for endpoint: ${config.endpoint}`,
  });
}

main().catch((error) => {
  console.error(`Fatal error in main(): ${error}`);
  process.exit(1);
});
