// src/utils/response.js

import { mapKnownErrors } from "../helpers.js";
import AppError from "./AppError.js";

/**
 * Unified success response
 * @param {import('express').Response} res
 * @param {any} data
 * @param {string} [message='OK']
 * @param {number} [statusCode=200]
 */
export const sendSuccess = (
	res,
	data = null,
	message = "OK",
	statusCode = 200,
) => {
	return res.status(statusCode).json({
		status: "success",
		message,
		data,
		error: null,
	});
};

/**
 * Express global error middleware. Use as `app.use(handleError)` at the end.
 * Delegates to sendError so behavior is identical whether used directly or via middleware.
 *  Send an error response immediately (use inside controllers).
 *  This function never throws.
 *  @param {import('express').Response} res
 *  @param {any} err
 */

export const handleError = (err, res) => {
	// If headers already sent we can't modify the response; log and return
	if (res.headersSent) {
		console.error("[sendError] headers already sent", err);
		return;
	}

	// If it's already our AppError, use it. Otherwise try to map known errors.
	let error = err instanceof AppError ? err : mapKnownErrors(err);

	if (!error) {
		// Wrap unknown errors to avoid leaking internal details
		const message = err?.message || "Internal Server Error";
		error = new AppError(message, err?.statusCode ?? 500, {
			code: err?.code ?? null,
			details: safeDetails(err),
			isOperational: false,
		});
	}

	if (process.env.NODE_ENV === "production") {
		// Logging: use a real logger in production instead of console
		if (!error.isOperational) {
			console.error("[FATAL]", error.message);
		} else {
			console.warn("[ERROR]", error.message, error.code ?? "");
		}
	} else {
		// Dev: full error for debugging
		console.error("[ERROR HANDLER]", error);
	}

	// Build consistent response shape
	const body = {
		status: "error",
		message: error.isOperational ? error.message : "Something went wrong",
		data: null,
		error: {
			code: error.code ?? null,
			details: error.details ?? null,
		},
	};

	return res.status(error.statusCode ?? 500).json(body);
};
