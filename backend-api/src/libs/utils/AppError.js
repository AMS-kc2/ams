// src/utils/AppError.js
export default class AppError extends Error {
	/**
	 * @param {string} message
	 * @param {number} [statusCode=500]
	 * @param {object} [opts]
	 * @param {string} [opts.code] - short machine-friendly error code
	 * @param {any} [opts.details] - extra details (optional, safe to send)
	 * @param {boolean} [opts.isOperational=true] - operational vs programming error
	 */
	constructor(message, statusCode = 500, opts = {}) {
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
