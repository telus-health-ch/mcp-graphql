# mcp-graphql

Model Context Protocol server for working with GraphQL servers.

> [!CAUTION]
> This is still work in progress, it will only work for GraphQL servers that allow introspection

## Usage
Run `mcp-graphql` with the correct endpoint, it will automatically try to introspect your queries.

```bash
# Example using a local GraphQL server which also publicly outputs the GraphQL schema
mcp-graphql --endpoint http://localhost:3000/graphql --headers '{"X-Custom-Header":"foobar"}'
```

## Goals
This should be usable as a generic MCP server for any type of GraphQL instance and will also have tooling to create your own more specific GraphQL MCP servers (e.g. restrict queries and mutations or add additional resources)

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
