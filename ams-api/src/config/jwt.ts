import jwt from "jsonwebtoken";
import { JWT_SECRET, type JWTPayload } from "../types/auth";

/**
 * Creates a JWT token for a given user payload.
 * @param payload - The user data to be signed into the token.
 * @returns The signed JWT string.
 */
export const createToken = (payload: JWTPayload): string => {
	return jwt.sign(payload, JWT_SECRET, {
		expiresIn: "7d", // Token expires in 7 days
	});
};

/**
 * Verifies a JWT token.
 * @param token - The JWT string from the cookie.
 * @returns The decoded payload if valid, otherwise throws an error.
 */
export const verifyToken = (token: string): JWTPayload => {
	// 'as JWTPayload' asserts the type after successful verification
	return jwt.verify(token, JWT_SECRET) as JWTPayload;
};
