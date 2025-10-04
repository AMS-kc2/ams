// @ts-check
import { Router } from "express";
import {
	lecturerLogin,
	lecturerSignUp,
	studentLogin,
	studentSignup,
} from "@/controllers/auth.controller.js";

const AuthRoute = Router();

// Students Auths
AuthRoute.post("/students/log-in", studentLogin);
AuthRoute.post("/students/sign-up", studentSignup);

//Lecturer Auths
AuthRoute.post("/lecturer/log-in", lecturerLogin);
AuthRoute.post("/lecturer/sign-up", lecturerSignUp);

export default AuthRoute;
