// @ts-check

// import cookieParser from "cookie-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
// import jwt from 'jsonwebtoken';

import { handleError } from "./libs/utils/response";
import { authenticateJWT } from "./middleware";
// Routes
import AttendanceRoutes from "./routes/attendance.route";
import AuthRoutes from "./routes/auth.route";
import CourseRoutes from "./routes/course.route";
import LecturerRoutes from "./routes/lecturer.route";
import SessionRoutes from "./routes/session.route";
import StudentRoutes from "./routes/student.route";

dotenv.config();

const PORT = process.env.PORT ?? "4000";
const app = express();

// IMPORTANT: Trust proxy - Add this BEFORE rate limiting
app.set("trust proxy", 1);

// 1️⃣ Security headers
app.use(helmet());

// 2️⃣ CORS (tweak origin or use a whitelist in production)
app.use(
	cors({
		origin: ["http://localhost:3000", "https://attendance-ms-2.vercel.app/"],
		credentials: true,
	}),
);

// 3️⃣ Rate limiting (100 reqs per 15m per IP)
app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 100,
		standardHeaders: true,
		legacyHeaders: false,
	}),
);

// 4️⃣ Parse JSON + cookies
app.use(express.json());
app.use(cookieParser());

// 5️⃣ Response compression
app.use(compression());

// 6️⃣ Request logging (dev-friendly)
app.use(morgan("dev"));

// Routes
app.use("/v1/auth", AuthRoutes);
app.use("/v1/lecturers", authenticateJWT, LecturerRoutes);
app.use("/v1/students", authenticateJWT, StudentRoutes);
app.use("/v1/courses", CourseRoutes);
app.use("/v1/sessions", authenticateJWT, SessionRoutes);
app.use("/v1/attendances", authenticateJWT, AttendanceRoutes);

// Welcome endpoint

app.get("/", (_, res) => {
	res.send("Welcome to the KSC-2.0 Backend API!");
});

// Health check endpoint
app.get("/v1/health", (_, res) => {
	res.status(200).send("OK");
});

app.use(handleError);

app.listen(PORT, () => {
	console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
