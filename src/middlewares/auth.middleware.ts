import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import type { AuthenticatedUser } from '../dto/auth.dto.js';

interface JwtPayload {
  sub: string;
  role: AuthenticatedUser['role'];
  teamId: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication required',
    });

    return;
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid authorization format',
    });

    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      status: 'error',
      message: 'JWT_SECRET is not configured',
    });

    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = {
      id: decoded.sub,
      role: decoded.role,
      teamId: decoded.teamId,
    };

    next();
  } catch {
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token',
    });
  }
};

export default authMiddleware;