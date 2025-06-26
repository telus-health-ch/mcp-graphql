import express from 'express';
import type { Request, Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { parse } from "graphql/language";
import { z } from "zod";
import { checkDeprecatedArguments } from "./helpers/deprecation.js";
import {
    introspectEndpoint,
    introspectLocalSchema,
} from "./helpers/introspection.js";
import { getVersion } from "./helpers/package.js" with { type: "macro" };
import { generateJwt } from "./helpers/generateJwt.js";
import logger from "./helpers/logger.js";

// Check for deprecated command line arguments
checkDeprecatedArguments();

const EnvSchema = z.object({
    NAME: z.string().default("mcp-graphql"),
    ENDPOINT: z.string().url().default("http://localhost:4000/graphql"),
    ALLOW_MUTATIONS: z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .default("false"),
    HEADERS: z
        .string()
        .default("{}")
        .transform((val) => {
            try {
                return JSON.parse(val);
            } catch (e) {
                throw new Error("HEADERS must be a valid JSON string");
            }
        }),
    SCHEMA: z.string().optional(),
    JWT_CONFIGURATION: z
        .string()
        .optional()
        .transform((val) => {
            if (!val) return undefined;
            try {
                return JSON.parse(val);
            } catch (e) {
                throw new Error("JWT_CONFIGURATION must be a valid JSON string");
            }
        }),
    LOG_DIR: z.string().optional(),
    PORT: z.string().transform(Number).default("3000")
});

const env = EnvSchema.parse(process.env);

// Function to create and configure a new MCP server instance
function getServer() {
  const server =  new McpServer({
    name: 'mcp-graphql-stateless',
    version: '1.0.0',
    description: 'GraphQL MCP Stateless Server',
  });


  server.resource("graphql-schema", new URL(env.ENDPOINT).href, async (uri: URL) => {
    try {
        let schema: string;
        if (env.SCHEMA) {
            schema = await introspectLocalSchema(env.SCHEMA);
        } else {
            const jwt = generateJwt(env.JWT_CONFIGURATION);
            const headers = {
                ...env.HEADERS,
                ...(jwt && { "Authorization": `Bearer ${jwt}` })
            };
            schema = await introspectEndpoint(env.ENDPOINT, headers);
        }
  
        return {
            contents: [
                {
                    uri: uri.href,
                    text: schema,
                },
            ],
        };
    } catch (error) {
        throw new Error(`Failed to get GraphQL schema: ${error}`);
    }
  });
  
  server.tool(
    "introspect-schema",
    "Introspect the GraphQL schema, use this tool before doing a query to get the schema information if you do not have it available as a resource already.",
    {
        // This is a workaround to help clients that can't handle an empty object as an argument
        // They will often send undefined instead of an empty object which is not allowed by the schema
        __ignore__: z
            .boolean()
            .default(false)
            .describe("This does not do anything"),
    },
    async () => {
        try {
            let schema: string;
            if (env.SCHEMA) {
                schema = await introspectLocalSchema(env.SCHEMA);
            } else {
                const jwt = generateJwt(env.JWT_CONFIGURATION);
                const headers = {
                    ...env.HEADERS,
                    ...(jwt && { "Authorization": `Bearer ${jwt}` })
                };
                schema = await introspectEndpoint(env.ENDPOINT, headers);
            }
  
            return {
                content: [
                    {
                        type: "text",
                        text: schema,
                    },
                ],
            };
        } catch (error) {
            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: `Failed to introspect schema: ${error}`,
                    },
                ],
            };
        }
    },
  );
  
  server.tool(
    "query-graphql",
    "Query a GraphQL endpoint with the given query and variables",
    {
        query: z.string(),
        variables: z.string().optional(),
    },
    async ({ query, variables }: { query: string; variables?: string }) => {
        try {
            const parsedQuery = parse(query);
  
            // Check if the query is a mutation
            const isMutation = parsedQuery.definitions.some(
                (def) =>
                    def.kind === "OperationDefinition" && def.operation === "mutation",
            );
  
            if (isMutation && !env.ALLOW_MUTATIONS) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: "Mutations are not allowed unless you enable them in the configuration. Please use a query operation instead.",
                        },
                    ],
                };
            }
        } catch (error) {
            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: `Invalid GraphQL query: ${error}`,
                    },
                ],
            };
        }
  
        try {
            const jwt = generateJwt(env.JWT_CONFIGURATION);
            
            const headers = {
                "Content-Type": "application/json",
                ...env.HEADERS,
                ...(jwt && { "Authorization": `Bearer ${jwt}` })
            };
  
            const response = await fetch(env.ENDPOINT, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    query,
                    variables,
                }),
            });
  
            if (!response.ok) {
                const responseText = await response.text();
  
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: `GraphQL request failed: ${response.statusText}\n${responseText}`,
                        },
                    ],
                };
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
                                2,
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
            throw new Error(`Failed to execute GraphQL query: ${error}`);
        }
    },
  );
  
  server.prompt('search-account', "This prompt provides guidance on how to search for accounts using the GraphQL endpoint, explaining the structure of accounts and offering an example query.", () => ({
    messages: [{
      role: "assistant",
      content: {
        type: "text",
        text: `When using this GraphQL endpoint to search for accounts, please keep in mind the following:
  * Accounts are commonly referred to by their domain names. for example, a clinic with a name of "High Park Medical Clinic" would have an accountId of 1 and a domain of "hpmc".
  * when using the searchAccounts tool, you can use the domain name as a search term to find the accountId.
  * The accountId is a number that uniquely identifies the account in the system.
  * The account is used to segment data between different customers
  * This is an example of a GraphQL you might use to find an account by its domain:
  * query GetAccounts {
    accounts(
      pagination: { first: 100 }
      filters: {
        domain: "clinic2"
      }
    ) {
      nodes {
        id
        name
        domain
      }
      totalCount
    }
  }`
      }
    }]
  }))
  return server;
}

const app = express();
app.use(express.json());

app.post('/mcp', async (req: Request, res: Response) => {
  // In stateless mode, create a new instance of transport and server for each request
  // to ensure complete isolation. A single instance would cause request ID collisions
  // when multiple clients connect concurrently.
  
  try {
    const server = getServer(); 
    const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    res.on('close', () => {
      console.log('Request closed');
      transport.close();
      server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});

app.get('/mcp', async (req: Request, res: Response) => {
  console.log('Received GET MCP request');
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed."
    },
    id: null
  }));
});

app.delete('/mcp', async (req: Request, res: Response) => {
  console.log('Received DELETE MCP request');
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed."
    },
    id: null
  }));
});


// Start the server
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5900;
app.listen(PORT, () => {
  console.log(`MCP Stateless Streamable HTTP Server listening on port ${PORT}`);
});