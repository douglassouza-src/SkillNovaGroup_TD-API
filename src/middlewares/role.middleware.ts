import type { NextFunction, Request, Response } from 'express';

import type { AuthenticatedUser } from '../dto/auth.dto.js';

type UserRole = AuthenticatedUser['role'];

const requireRoles = (...allowedRoles: UserRole[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });

      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions',
      });

      return;
    }

    next();
  };
};

export default requireRoles;