import type { NextFunction, Request, Response } from "express";
import { mapKnownErrors } from "../helpers";
import AppError from "./AppError";

function safeDetails(err: Error) {
	if (!err) return null;

	return process.env.NODE_ENV === "development"
		? { message: err.message, stack: err.stack }
		: { message: err.message };
}

function buildError(err: unknown) {
	let error = err instanceof AppError ? err : mapKnownErrors(err);

	if (!error) {
		// Type assertion to Error for accessing message and statusCode
		const errorObj = err as Error & { statusCode?: number; code?: string };
		error = new AppError(
			errorObj?.message || "Internal Server Error",
			errorObj?.statusCode ?? 500,
			{
				code: errorObj?.code ?? "",
				details: safeDetails(errorObj),
				isOperational: false,
			},
		);
	}
	return error;
}

export const sendSuccess = (
	res: Response,
	data: object | null = null,
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

export const sendError = (err: unknown, res: Response) => {
	const error = buildError(err);
	console.error(error);

	return res.status(error.statusCode ?? 500).json({
		status: "error",
		message: error.isOperational ? error.message : "Something went wrong",
		data: null,
		error: {
			code: error.code ?? null,
			details: error.details ?? null,
		},
	});
};

// Express error middleware
export const handleError = (
	err: Error,
	_: Request,
	res: Response,
	next: NextFunction,
) => {
	if (res.headersSent) return next(err);

	const error = buildError(err);

	return res.status(error.statusCode ?? 500).json({
		status: "error",
		message: error.isOperational ? error.message : "Something went wrong",
		data: null,
		error: {
			code: error.code ?? null,
			details: error.details ?? null,
		},
	});
};
