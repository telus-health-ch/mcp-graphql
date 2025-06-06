#!/usr/bin/env node

import { z } from "zod";
import { generateJwt } from "./helpers/generateJwt.js";
import { introspectEndpoint } from "./helpers/introspection.js";
import { writeFile } from "node:fs/promises";

const EnvSchema = z.object({
	ENDPOINT: z.string().url().default("http://localhost:4000/graphql"),
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
    SCHEMA: z.string(),
	PRIVATE_KEY_PATH: z.string(),
});

const env = EnvSchema.parse(process.env);

const jwt = generateJwt();
if (!jwt) {
    throw new Error("Failed to generate JWT token");
}
const headers = {
    ...env.HEADERS,
    "Authorization": `Bearer ${jwt}`
};

const schema = await introspectEndpoint(env.ENDPOINT, headers);

console.log("Schema introspection complete. Writing to file...");
console.log(`Writing schema to ${env.SCHEMA}`);

await writeFile(env.SCHEMA, schema, "utf8");
