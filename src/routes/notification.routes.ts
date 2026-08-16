import { Router } from 'express';

import authMiddleware from '../middlewares/auth.middleware.js';
import * as notificationController from '../controllers/notification.controller.js';
import requireRoles from '../middlewares/role.middleware.js';

const router = Router();

router.post(
  '/alerts',
  authMiddleware,
  requireRoles('TECHNICIAN'),
  (req, res, next) => {
    notificationController
      .sendAlert(req, res)
      .catch(next);
  },
);

export default router;