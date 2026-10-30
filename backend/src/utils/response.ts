import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types/index.js';

export function sendSuccess<T>(res: Response, data: T, message = 'Operation completed successfully', statusCode = 200): Response {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    message
  };
  return res.status(statusCode).json(payload);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Data retrieved successfully'
): Response {
  const totalPages = Math.ceil(total / limit) || 1;
  const payload: PaginatedResponse<T> = {
    success: true,
    data,
    message,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
  return res.status(200).json(payload);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode = 500,
  details?: any[]
): Response {
  const payload: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details
    }
  };
  return res.status(statusCode).json(payload);
}

