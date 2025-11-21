export class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    code?: string;

    constructor(code: string, message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.code = code;

        Error.captureStackTrace(this, this.constructor);
    }
}
