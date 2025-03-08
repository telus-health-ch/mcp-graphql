# mcp-graphql

[![smithery badge](https://smithery.ai/badge/mcp-graphql)](https://smithery.ai/server/mcp-graphql)

A Model Context Protocol server that enables LLMs to interact with GraphQL APIs. This implementation provides schema introspection and query execution capabilities, allowing models to discover and use GraphQL APIs dynamically.

<a href="https://glama.ai/mcp/servers/4zwa4l8utf"><img width="380" height="200" src="https://glama.ai/mcp/servers/4zwa4l8utf/badge" alt="mcp-graphql MCP server" /></a>

## Usage

Run `mcp-graphql` with the correct endpoint, it will automatically try to introspect your queries.

### Command Line Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--endpoint` | GraphQL endpoint URL | `http://localhost:4000/graphql` |
| `--headers` | JSON string containing headers for requests | `{}` |
| `--enable-mutations` | Enable mutation operations (disabled by default) | `false` |
| `--name` | Name of the MCP server | `mcp-graphql` |
| `--schema` | Path to a local GraphQL schema file (optional) | - |

### Examples

```bash
# Basic usage with a local GraphQL server
npx mcp-graphql --endpoint http://localhost:3000/graphql

# Using with custom headers
npx mcp-graphql --endpoint https://api.example.com/graphql --headers '{"Authorization":"Bearer token123"}'

# Enable mutation operations
npx mcp-graphql --endpoint http://localhost:3000/graphql --enable-mutations

# Using a local schema file instead of introspection
npx mcp-graphql --endpoint http://localhost:3000/graphql --schema ./schema.graphql
```

## Available Tools

The server provides two main tools:

1. **introspect-schema**: This tool retrieves the GraphQL schema. Use this first if you don't have access to the schema as a resource.
This uses either the local schema file or an introspection query.

2. **query-graphql**: Execute GraphQL queries against the endpoint. By default, mutations are disabled unless `--enable-mutations` is specified.

## Resources

- **graphql-schema**: The server exposes the GraphQL schema as a resource that clients can access. This is either the local schema file or based on an introspection query.

## Installation

### Installing via Smithery

To install GraphQL MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/mcp-graphql):

```bash
npx -y @smithery/cli install mcp-graphql --client claude
```

### Installing Manually

It can be manually installed to Claude:
```json
{
    "mcpServers": {
        "mcp-graphql": {
            "command": "npx",
            "args": ["mcp-graphql", "--endpoint", "http://localhost:3000/graphql"]
        }
    }
}
```

## Security Considerations

Mutations are disabled by default as a security measure to prevent an LLM from modifying your database or service data. Consider carefully before enabling mutations in production environments.

## Customize for your own server

This is a very generic implementation where it allows for complete introspection and for your users to do whatever (including mutations). If you need a more specific implementation I'd suggest to just create your own MCP and lock down tool calling for clients to only input specific query fields and/or variables. You can use this as a reference.
