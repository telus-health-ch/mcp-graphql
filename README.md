# mcp-graphql

Model Context Protocol server for working with GraphQL servers.

> [!CAUTION]
> This is still work in progress

## Usage
Run `mcp-graphql` with the correct endpoint and url for schema (introspection support WIP).

```bash
# Example using a local GraphQL server which also publicly outputs the GraphQL schema
SCHEMA_URL=http://localhost:3000/schema.graphql mcp-graphql http://localhost:3000/graphql
```

## Goals
This should be usable as a generic MCP server for any type of GraphQL instance and will also have tooling to create your own more specific GraphQL MCP servers (e.g. restrict queries and mutations)

## Development

To install dependencies:

```bash
bun install
```

To run for development:

```bash
bun dev
```

To build:

```bash
bun run build
```
