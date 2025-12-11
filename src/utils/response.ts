import type { Response } from 'express';
import type { ApiResponse } from '../types/index.js';
import type { ZodError } from 'zod';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  paging?: { current_page: number; total_page: number; size: number },
  message?: string
): Response {
  const response: ApiResponse<T> = { data };
  if (paging) {
    response.paging = paging;
  }
  if (message) {
    response.message = message;
  }
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  error: string | Record<string, string[]>,
  statusCode: number = 400
): Response {
  const response: ApiResponse<null> = {
    errors: error,
  };
  return res.status(statusCode).json(response);
}

export function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  (error as any).issues.forEach((err: any) => {
    const path = err.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(err.message);
  });
  return formatted;
}
