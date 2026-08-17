import { Router } from 'express';

import dashboardController from '../controllers/dashboard.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import requireRoles from '../middlewares/role.middleware.js';

const router = Router();

router.get(
  '/manager',
  authMiddleware,
  requireRoles(
    'MASTER',
    'MANAGER',
  ),
  (req, res, next) => {
    dashboardController
      .manager(req, res)
      .catch(next);
  },
);

export default router;