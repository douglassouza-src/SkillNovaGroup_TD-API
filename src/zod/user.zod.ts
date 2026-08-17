import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(150),

  email: z
    .string()
    .trim()
    .email()
    .max(255),

  password: z
    .string()
    .min(8)
    .max(255),

  role: z.enum([
    'MASTER',
    'MANAGER',
    'COORDINATOR',
    'TECHNICIAN',
  ]),

  teamId: z
    .uuid()
    .nullable()
    .optional(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(150)
    .optional(),

  email: z
    .string()
    .trim()
    .email()
    .max(255)
    .optional(),
});

export const changeUserRoleSchema =
  z.object({
    role: z.enum([
      'MASTER',
      'MANAGER',
      'COORDINATOR',
      'TECHNICIAN',
    ]),

    reason: z
      .string()
      .trim()
      .min(1)
      .max(1000),
  });

export const changeUserTeamSchema =
  z.object({
    teamId: z
      .uuid()
      .nullable(),

    reason: z
      .string()
      .trim()
      .min(1)
      .max(1000),
  });

export const deactivateUserSchema =
  z.object({
    reason: z
      .string()
      .trim()
      .min(1)
      .max(1000),
  });


export const listUsersQuerySchema = z.object({
  role: z
    .enum(['MASTER', 'MANAGER', 'COORDINATOR', 'TECHNICIAN'])
    .optional(),

  teamId: z
    .uuid()
    .optional(),

  isActive: z
    .enum(['true', 'false'])
    .optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;