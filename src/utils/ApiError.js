class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = '', code = null) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    this.errors = errors;
    this.code = code;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errors: this.errors,
      code: this.code,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}


export {ApiError}