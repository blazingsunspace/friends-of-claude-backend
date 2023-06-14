import HTTP_STATUS from 'http-status-codes'

export interface IErrorResponse {
	message: string
	statusCode: number
	status: string
	serializeErrors(): IError
}

export interface IError {
	message: string
	statusCode: number
	status: string
	data?: object
}

export abstract class CustomError extends Error {
	abstract statusCode: number
	abstract status: string
	abstract data: object
	constructor(message: string) {
		super(message)
	}

	serializeErrors(): IError {
		return {
			message: this.message,
			status: this.status,
			statusCode: this.statusCode,
			data: this.data
		}
	}
}

export class JoiRequestValidationError extends CustomError {
	statusCode = HTTP_STATUS.BAD_REQUEST
	status = 'vallidation error'
	data = {}
	constructor(message: string) {
		super(message)
	}
}

export class BadRequestError extends CustomError {
	statusCode = HTTP_STATUS.BAD_REQUEST
	status = 'error'
	data = {}
	constructor(message: string) {
		super(message)
	}
}

export class UserDidNotAcceptTermsAndConditions extends CustomError {
	statusCode = HTTP_STATUS.NOT_ACCEPTABLE
	status = 'user did not accept terms and conditions'
	data = {}
	constructor(message: string) {
		super(message)
	}
}

export class NotAcceptableError extends CustomError {
	statusCode = HTTP_STATUS.NOT_ACCEPTABLE
	status = 'not acceptable'
	data = {}
	constructor(message: string) {
		super(message)
	}
}

export class NotFoundError extends CustomError {
	statusCode = HTTP_STATUS.NOT_FOUND
	status = 'not found'
	data = {}
	constructor(message: string) {
		super(message)
	}
}

export class YouNeedToSetPasswordError extends CustomError {
	statusCode = HTTP_STATUS.UNAUTHORIZED
	status = 'not authorized'
	data = { setPassword: true }
	constructor(message: string) {
		super(message)
	}
}
export class NotAuthorizedError extends CustomError {
	statusCode = HTTP_STATUS.UNAUTHORIZED
	status = 'not authorized'
	data = {}
	constructor(message: string) {
		super(message)
	}
}

export class FileTooLargeError extends CustomError {
	statusCode = HTTP_STATUS.REQUEST_TOO_LONG
	status = 'File too large'
	data = {}
	constructor(message: string) {
		super(message)
	}
}

export class ServerError extends CustomError {
	statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE
	status = 'Service unavailable'
	data = {}
	constructor(message: string) {
		super(message)
	}
}
