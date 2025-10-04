// src/utils/AppError.js
/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> none */

type optType = {
	code: string,
	details: any,
	isOperational: boolean,
}
export default class AppError extends Error {
	statusCode: number;
	code: string;
	details: any;
	isOperational: boolean;
	status: string;

	constructor(message: string, statusCode: number = 500, opts: optType  = {
		code: '',
		details: undefined,
		isOperational: true
	}) {
		super(message);
		this.name = this.constructor.name;
		this.statusCode = statusCode;
		this.code = opts.code ?? null;
		this.details = opts.details ?? null;
		this.isOperational = opts.isOperational ?? true;

		// friendly status (4xx = fail, 5xx = error)
		this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}
