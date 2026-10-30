export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any[];

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: any[]) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'The supplied request is invalid', details?: any[]) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required or token expired') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access forbidden for this resource') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict or duplicate record') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please slow down.') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message = 'External service communication failed') {
    super(`${service}: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR');
  }
}

