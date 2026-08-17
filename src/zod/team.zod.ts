import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(150),

  description: z
    .string()
    .trim()
    .max(5000)
    .nullable()
    .optional(),

  managerId: z
    .uuid()
    .nullable()
    .optional(),

  coordinatorId: z
    .uuid()
    .nullable()
    .optional(),
});

export const updateTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(150)
    .optional(),

  description: z
    .string()
    .trim()
    .max(5000)
    .nullable()
    .optional(),
});

export const assignTeamManagerSchema = z.object({
  managerId: z.uuid(),
});

export const assignTeamCoordinatorSchema =
  z.object({
    coordinatorId: z.uuid(),
  });

  export const deactivateTeamSchema =
  z.object({
    reason: z
      .string()
      .trim()
      .min(1)
      .max(1000),
  });