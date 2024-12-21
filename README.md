# mcp-graphql

Model Context Protocol server for working with GraphQL servers.

## Usage
Run `mcp-graphql` with the correct endpoint and url for schema (introspection support WIP).

```bash
# Example using a local GraphQL server which also publicly outputs the GraphQL schema
SCHEMA_URL=http://localhost:3000/schema.graphql mcp-graphql http://localhost:3000/graphql
```

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.41. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
