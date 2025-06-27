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
	SCHEMA: z.string().default("./schema.graphql"),
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
});

const env = EnvSchema.parse(process.env);

async function main() {
	try {
		// Generate JWT if configuration is provided
		const jwt = generateJwt(env.JWT_CONFIGURATION);
		
		// Add JWT to headers if available
		const headers = {
			...env.HEADERS,
			...(jwt && { "Authorization": `Bearer ${jwt}` })
		};

		console.log(`Introspecting schema from ${env.ENDPOINT}...`);
		const schema = await introspectEndpoint(env.ENDPOINT, headers);

		console.log("Schema introspection complete. Writing to file...");
		console.log(`Writing schema to ${env.SCHEMA}`);

		await writeFile(env.SCHEMA, schema, "utf8");
		console.log("Schema successfully written to file.");
	} catch (error) {
		console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
		process.exit(1);
	}
}

main();
