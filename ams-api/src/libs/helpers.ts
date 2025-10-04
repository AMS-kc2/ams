
import { ZodError, type ZodIssue } from "zod";
import AppError from "./utils/AppError";

// Safer helper: only include details in dev
const safeDetails = <T>(details: T | null): T | null => {
	if (process.env.NODE_ENV === "production") return null;
	return details;
};

/**
 * Map known DB or lib errors to AppError (lightweight, independent of prisma import).
 * Returns an AppError or null if no mapping applied.
 */
export const mapKnownErrors = (err: unknown): AppError | null => {
	if (!err || typeof err !== "object") return null;

	// Handle Zod validation errors
	if (err instanceof ZodError) {
		const issues = err.issues.map((i: ZodIssue) => ({
			path: i.path.length ? i.path.join(".") : "",
			message: i.message,
		}));

		const message = issues.length
			? `${issues[0].path}: ${issues[0].message}`
			: "Invalid input";

		return new AppError(message, 400, {
			code: "VALIDATION_ERROR",
			details: safeDetails(issues),
			isOperational: true,
		});
	}

	// Prisma-style error handling (duck-typed)
	const maybeErr = err as { code?: string; meta?: unknown };

	if (maybeErr.code) {
		switch (maybeErr.code) {
			case "P2002":
				return new AppError("Duplicate value violates unique constraint", 409, {
					code: "DB_DUPLICATE",
					details: safeDetails(maybeErr.meta ?? null),
					isOperational: true,
				});
			case "P2025":
				return new AppError("Requested record not found", 404, {
					code: "DB_NOT_FOUND",
					details: safeDetails(maybeErr.meta ?? null),
					isOperational: true,
				});
			case "P2003":
				return new AppError("Foreign key constraint failed", 400, {
					code: "DB_FOREIGN_KEY",
					details: safeDetails(maybeErr.meta ?? null),
					isOperational: true,
				});
			default:
				return new AppError("Database error", 500, {
					code: "DB_ERROR",
					details: safeDetails(maybeErr.meta ?? maybeErr),
					isOperational: false,
				});
		}
	}

	return null;
};

/**
 * Generate a 6-digit OTP (100000–999999).
 */
export const generateOtp = (): number => {
	return Math.floor(100000 + Math.random() * 900000);
};
