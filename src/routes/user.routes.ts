import { Router } from 'express';

import authMiddleware from '../middlewares/auth.middleware.js';
import requireRoles from '../middlewares/role.middleware.js';

import userController from '../controllers/user.controller.js';

const router = Router();

router.post(
  '/',
  authMiddleware,
  requireRoles('MASTER'),
  (req, res, next) => {
    userController
      .create(req, res)
      .catch(next);
  },
);

router.get(
  '/',
  authMiddleware,
  requireRoles(
    'MASTER',
    'MANAGER',
    'COORDINATOR',
  ),
  (req, res, next) => {
    userController
      .list(req, res)
      .catch(next);
  },
);

router.get(
  '/:userId',
  authMiddleware,
  requireRoles(
    'MASTER',
    'MANAGER',
    'COORDINATOR',
  ),
  (req, res, next) => {
    userController
      .findById(req, res)
      .catch(next);
  },
);

router.patch(
  '/:userId',
  authMiddleware,
  requireRoles('MASTER'),
  (req, res, next) => {
    userController
      .update(req, res)
      .catch(next);
  },
);

router.patch(
  '/:userId/role',
  authMiddleware,
  requireRoles('MASTER'),
  (req, res, next) => {
    userController
      .changeRole(req, res)
      .catch(next);
  },
);

router.patch(
  '/:userId/team',
  authMiddleware,
  requireRoles('MASTER'),
  (req, res, next) => {
    userController
      .changeTeam(req, res)
      .catch(next);
  },
);

router.patch(
  '/:userId/deactivate',
  authMiddleware,
  requireRoles('MASTER'),
  (req, res, next) => {
    userController
      .deactivate(req, res)
      .catch(next);
  },
);

export default router;