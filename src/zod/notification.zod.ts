import { z } from 'zod';

export const sendNotificationAlertSchema =
  z.object({
    trainingSessionId: z.uuid(),
  });