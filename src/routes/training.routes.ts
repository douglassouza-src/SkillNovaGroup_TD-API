import { Router } from 'express';

import trainingController from '../controllers/training.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import requireRoles from '../middlewares/role.middleware.js';

const router = Router();

router.get(
  '/',
  authMiddleware,
  requireRoles(
    'MASTER',
    'MANAGER',
    'COORDINATOR',
    'TECHNICIAN',
  ),
  (req, res, next) => {
    trainingController
      .list(req, res)
      .catch(next);
  },
);

router.post(
  '/',
  authMiddleware,
  requireRoles(
    'MASTER',
    'MANAGER',
    'COORDINATOR',
  ),
  (req, res, next) => {
    trainingController
      .create(req, res)
      .catch(next);
  },
);

router.post(
  '/sessions',
  authMiddleware,
  requireRoles(
    'MASTER',
    'MANAGER',
    'COORDINATOR',
  ),
  (req, res, next) => {
    trainingController
      .createSession(req, res)
      .catch(next);
  },
);

router.get(
'/me',
authMiddleware,
requireRoles('TECHNICIAN'),
(req, res, next) => {
  trainingController
    .listTechnicianTrainings(req, res)
    .catch(next);
},
)

router.patch(
  '/participants/:participantId/attendance',
  authMiddleware,
  requireRoles(
    'MASTER',
    'MANAGER',
    'COORDINATOR',
  ),
  (req, res, next) => {
    trainingController
      .recordAttendance(req, res)
      .catch(next);
  },
);

router.patch(
  '/participants/:participantId/evaluation',
  authMiddleware,
  requireRoles(
    'MASTER',
    'MANAGER',
    'COORDINATOR',
  ),
  (req, res, next) => {
    trainingController
      .recordEvaluation(req, res)
      .catch(next);
  },
);

router.get(
  '/me/history',
  authMiddleware,
  requireRoles('TECHNICIAN'),
  (req, res, next) => {
    trainingController
      .listTechnicianTrainings(req, res)
      // .listTechnicianTrainingHistory(req, res)
      .catch(next);
  },
);

router.patch(
  '/sessions/:sessionId/participants/:participantId/attendance',
  authMiddleware,
  requireRoles(
    'MASTER',
    'MANAGER',
    'COORDINATOR',
  ),
  (req, res, next) => {
    trainingController
      .recordAttendance(req, res)
      .catch(next);
  },
);

router.get(
  '/:trainingId/sessions',
  authMiddleware,
  requireRoles(
    'MASTER',
    'MANAGER',
    'COORDINATOR',
    'TECHNICIAN',
  ),
  (req, res, next) => {
    trainingController
      .listTrainingSessions(req, res)
      .catch(next);
  },
);

router.patch(
  '/sessions/:sessionId/reschedule',
  authMiddleware,
  requireRoles(
    'MASTER',
    'MANAGER',
    'COORDINATOR',
  ),
  (req, res, next) => {
    trainingController
      .rescheduleTrainingSession(req, res)
      .catch(next);
  },
);

router.patch(
  '/sessions/:sessionId/cancel',
  authMiddleware,
  requireRoles(
    'MASTER',
    'MANAGER',
    'COORDINATOR',
  ),
  (req, res, next) => {
    trainingController
      .cancelTrainingSession(req, res)
      .catch(next);
  },
);

router.get(
  '/me/todo',
  authMiddleware,
  requireRoles('TECHNICIAN'),
  (req, res, next) => {
    trainingController
      .listMyTodoTrainings(req, res)
      .catch(next);
  },
);

router.get(
  '/me/history',
  authMiddleware,
  requireRoles('TECHNICIAN'),
  (req, res, next) => {
    trainingController
      .listMyTrainingHistory(req, res)
      .catch(next);
  },
);

router.post(
  '/:trainingId/teams',
  authMiddleware,
  requireRoles(
    'MASTER',
    'MANAGER',
    'COORDINATOR',
  ),
  (req, res, next) => {
    trainingController
      .associateTeam(req, res)
      .catch(next);
  },
);

router.post(
  '/sessions/:sessionId/participants',
  authMiddleware,
  requireRoles(
    'MASTER',
    'MANAGER',
    'COORDINATOR',
  ),
  (req, res, next) => {
    trainingController
      .addParticipant(req, res)
      .catch(next);
  },

);


export default router;