export const formatZodError = (zErr) => {
	const first = zErr?.issues?.[0];
	if (!first) return "Invalid input";
	const path = first.path?.length ? `${first.path.join(".")}: ` : "";
	return `${path}${first.message}`;
};

/**
 * Sanitize details for sending to clients.
 * In production we'll avoid sending raw error objects.
 * @param {any} details
 */
const safeDetails = (details) => {
	if (process.env.NODE_ENV === "production") return null;
	// In dev show helpful info
	return details;
};

/**
 * Map known DB or lib errors to AppError (lightweight, independent of prisma import).
 * Returns an AppError or null if no mapping applied.
 * @param {any} err
 * @returns {AppError|null}
 */
export const mapKnownErrors = (err) => {
	if (!err) return null;

	// Zod validation
	if (err.name === "ZodError") {
		const issues = (err.issues || []).map((i) => ({
			path: i.path?.join(".") || "",
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

	// Prisma errors often expose a `.code` and `.meta`
	const code = err?.code ? String(err.code) : null;
	if (code) {
		switch (code) {
			case "P2002":
				return new AppError("Duplicate value violates unique constraint", 409, {
					code: "DB_DUPLICATE",
					details: safeDetails(err.meta ?? null),
					isOperational: true,
				});
			case "P2025":
				return new AppError("Requested record not found", 404, {
					code: "DB_NOT_FOUND",
					details: safeDetails(err.meta ?? null),
					isOperational: true,
				});
			case "P2003":
				return new AppError("Foreign key constraint failed", 400, {
					code: "DB_FOREIGN_KEY",
					details: safeDetails(err.meta ?? null),
					isOperational: true,
				});
			default:
				// don't reveal unknown prisma internals in prod
				return new AppError("Database error", 500, {
					code: "DB_ERROR",
					details: safeDetails(err.meta ?? err),
					isOperational: false,
				});
		}
	}

	return null;
};