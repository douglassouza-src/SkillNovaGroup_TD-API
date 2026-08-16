import type {
  Request,
  Response,
} from 'express';

import {
  sendNotificationAlertSchema,
} from '../zod/notification.zod.js';

import {
  sendTrainingAlert,
} from '../services/notification.service.js';

export async function sendAlert(
  req: Request,
  res: Response,
) {
  const data =
    sendNotificationAlertSchema.parse(req.body);

  const alert = await sendTrainingAlert(
    data.trainingSessionId,
    req.user!.id,
  );

  return res.status(201).json({
    alert,
  });
}