// @ts-check

import type { Response } from "express";
import { Router } from "express";
import {
	lecturerLogin,
	lecturerSignUp,
	studentLogin,
	studentSignup,
	logout,
} from "../controllers/auth.controller";
import AppError from "../libs/utils/AppError";
import { sendError, sendSuccess } from "../libs/utils/response";
import { authenticateJWT } from "../middleware";
import type { AuthenticatedRequest } from "../types/auth";

const AuthRouter = Router();

// Students Auths
AuthRouter.post("/students/log-in", studentLogin);
AuthRouter.post("/students/sign-up", studentSignup);

//Lecturer Auths
AuthRouter.post("/lecturer/log-in", lecturerLogin);
AuthRouter.post("/lecturer/sign-up", lecturerSignUp);

//shared routes
AuthRouter.post("/logout", logout);
AuthRouter.get(
	"/user-info",
	authenticateJWT,
	(req: AuthenticatedRequest, res: Response) => {
		// The authenticated user data is available at req.user
		const user = req.user;
		if (!user) {
			return sendError(new AppError("Unauthorized", 401), res);
		}
		// Respond with the verified user's data
		sendSuccess(res, {
			isLoggedIn: true,
			user,
		});
	},
);

export default AuthRouter;
