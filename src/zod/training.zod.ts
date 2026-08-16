import { z } from 'zod';

export const createTrainingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(200),

  description: z
    .string()
    .trim()
    .max(5000)
    .nullable()
    .optional(),

  type: z.enum([
    'MANDATORY',
    'OPTIONAL',
  ]),
});

export type CreateTrainingSchema = z.infer<
  typeof createTrainingSchema
>;

export const associateTrainingTeamSchema = z.object({
  teamId: z.uuid(),
});

export const createTrainingSessionSchema = z
  .object({
    trainingId: z.uuid(),

    startAt: z.iso.datetime({
      offset: true,
    }),

    endAt: z.iso.datetime({
      offset: true,
    }),

    location: z.string().trim().max(500).nullable().optional(),

    notes: z.string().trim().max(5000).nullable().optional(),
  })
  .refine(
    (data) => new Date(data.endAt) > new Date(data.startAt),
    {
      message: 'endAt must be after startAt',
      path: ['endAt'],
    },
  );

  export const addTrainingParticipantSchema = z.object({
  userId: z.uuid(),
});

export const recordAttendanceSchema = z.object({
  participationStatus: z.enum([
    'PARTICIPATED',
    'ABSENT',
  ]),
});

export const recordEvaluationSchema = z.object({
  evaluation: z.enum([
    'POOR',
    'GOOD',
    'VERY_GOOD',
  ]),
});

export const rescheduleTrainingSessionSchema = z
  .object({
    startAt: z.iso.datetime({
      offset: true,
    }),

    endAt: z.iso.datetime({
      offset: true,
    }),

    reason: z
      .string()
      .trim()
      .max(2000)
      .nullable()
      .optional(),
  })
  .refine(
    (data) =>
      new Date(data.endAt) >
      new Date(data.startAt),
    {
      message: 'endAt must be after startAt',
      path: ['endAt'],
    },
  );

  export const cancelTrainingSessionSchema =
  z.object({
    reason: z
      .string()
      .trim()
      .min(3)
      .max(2000),
  });

  