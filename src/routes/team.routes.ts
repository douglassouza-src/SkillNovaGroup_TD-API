import { Router } from 'express';

import authMiddleware from '../middlewares/auth.middleware.js';
import requireRoles from '../middlewares/role.middleware.js';
import teamController from '../controllers/team.controller.js';

const router = Router();

router.post(
  '/',
  authMiddleware,
  requireRoles(
    'MASTER',
    'MANAGER',
    'COORDINATOR',
  ),
  (req, res, next) => {
    teamController
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
    teamController
      .list(req, res)
      .catch(next);
  },
);

router.get(
  '/:teamId',
  authMiddleware,
  requireRoles(
    'MASTER',
    'MANAGER',
    'COORDINATOR',
  ),
  (req, res, next) => {
    teamController
      .findById(req, res)
      .catch(next);
  },
);

router.patch(
  '/:teamId',
  authMiddleware,
  requireRoles('MASTER'),
  (req, res, next) => {
    teamController
      .update(req, res)
      .catch(next);
  },
);

router.patch(
  '/:teamId/manager',
  authMiddleware,
  requireRoles('MASTER'),
  (req, res, next) => {
    teamController
      .assignManager(req, res)
      .catch(next);
  },
);

router.patch(
  '/:teamId/coordinator',
  authMiddleware,
  requireRoles('MASTER'),
  (req, res, next) => {
    teamController
      .assignCoordinator(req, res)
      .catch(next);
  },
);

router.patch(
  '/:teamId/deactivate',
  authMiddleware,
  requireRoles('MASTER'),
  (req, res, next) => {
    teamController
      .deactivate(req, res)
      .catch(next);
  },
);


export default router;