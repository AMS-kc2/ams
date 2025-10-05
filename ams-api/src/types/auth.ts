// src/types/auth.ts

import type { Request } from "express";

// ⚠️ IMPORTANT: Update this with your actual environment variable setup
export const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";
export const COOKIE_NAME = "auth_token";

export interface JWTPayload {
	id: number;
	role: "student" | "lecturer";
	matricNumber?: number;
	lecturerId?: number;
}

// Extend the Request object to include the authenticated user data
export interface AuthenticatedRequest extends Request {
	user?: JWTPayload;
}
