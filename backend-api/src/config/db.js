import { PrismaClient } from "../generated/prisma/client";

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 */

// Create or reuse singleton
const globalForPrisma = globalThis;

/** @type {PrismaClient} */
export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		log:
			process.env.NODE_ENV === "development"
				? ["query", "info", "warn", "error"]
				: ["error"],
		errorFormat: "pretty",
	});

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

export default prisma;