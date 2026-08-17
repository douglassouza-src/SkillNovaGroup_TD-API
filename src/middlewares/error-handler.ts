import type {
  NextFunction,
  Request,
  Response,
} from 'express';

import { ZodError } from 'zod';

export default function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.issues,
      },
    });
  }

  if (error instanceof Error) {
    const message = error.message;

    /**
     * Business/domain errors.
     *
     * We currently use regular Error instances
     * inside the services. Until we introduce a
     * dedicated AppError, map known messages here.
     */
    const badRequestMessages = [
      'Cannot evaluate a cancelled training session',
      'Cannot evaluate before the training session ends',
      'Only participants who attended the training can be evaluated',
      'Cannot deactivate user while assigned as manager of an active team',
      'Cannot deactivate user while assigned as coordinator of an active team',
      'Cannot change role while user is assigned as manager of an active team',
      'Cannot change role while user is assigned as coordinator of an active team',
      'Cannot change role of an inactive user',
      'User already has this role',
      'User is already inactive',
    ];

    if (
      badRequestMessages.includes(message)
    ) {
      return res.status(400).json({
        error: {
          code: 'BUSINESS_RULE_ERROR',
          message,
        },
      });
    }

    if (
      message.endsWith('not found')
    ) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message,
        },
      });
    }

    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      },
    });
  }

  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    },
  });
}