// src/middleware/auth.ts

import type { NextFunction, Response } from "express";
import { verifyToken } from "./config/jwt";
import AppError from "./libs/utils/AppError";
import { sendError } from "./libs/utils/response";
import { type AuthenticatedRequest, COOKIE_NAME } from "./types/auth";

/**
 * Express middleware to authenticate requests using the JWT from an HTTP-only cookie.
 */
export const authenticateJWT = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	const token = req.cookies[COOKIE_NAME];

	if (!token) {
		// return res.status(401).json({ message: "Unauthorized: No token provided" });
		return sendError(new AppError("Unauthorized: No token provided", 401), res);
	}

	try {
		const decoded = verifyToken(token);
		// Attach the decoded user data to the request object for downstream handlers
		req.user = decoded;
		next();
		// biome-ignore lint/correctness/noUnusedVariables: <no explanation>
	} catch (err) {
		sendError(new AppError("Forbidden: Invalid or expired token", 403), res);
	}
};
