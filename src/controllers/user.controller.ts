import type {
  Request,
  Response,
} from 'express';

import userService from '../services/user.service.js';

import {
  createUserSchema,
  updateUserSchema,
  changeUserRoleSchema,
  changeUserTeamSchema,
  deactivateUserSchema,
  listUsersQuerySchema,
} from '../zod/user.zod.js';

class UserController {
  async create(
    req: Request,
    res: Response,
  ) {
    const data =
      createUserSchema.parse(
        req.body,
      );

    const user =
      await userService.create(
        data,
        req.user!.id,
      );

    return res.status(201).json({
      user,
    });
  }

  async list(
    _req: Request,
    res: Response,
  ) {
    const users =
      await userService.list();

    return res.status(200).json({
      users,
    });
  }

  async findById(
    req: Request,
    res: Response,
  ) {
    const user =
      await userService.findById(
        req.params.userId as any,
      );

    return res.status(200).json({
      user,
    });
  }

  async update(
    req: Request,
    res: Response,
  ) {
    const data =
      updateUserSchema.parse(
        req.body,
      );

    const user =
      await userService.update(
        req.params.userId as any,
        data,
        req.user!.id,
      );

    return res.status(200).json({
      user,
    });
  }

  async changeRole(
    req: Request,
    res: Response,
  ) {
    const data =
      changeUserRoleSchema.parse(
        req.body,
      );

    const user =
      await userService.changeRole(
        req.params.userId as any,
        data.role,
        data.reason,
        req.user!.id,
      );

    return res.status(200).json({
      user,
    });
  }

  async changeTeam(
    req: Request,
    res: Response,
  ) {
    const data =
      changeUserTeamSchema.parse(
        req.body,
      );

    const user =
      await userService.changeTeam(
        req.params.userId as any,
        data.teamId,
        data.reason,
        req.user!.id,
      );

    return res.status(200).json({
      user,
    });
  }

  async deactivate(
    req: Request,
    res: Response,
  ) {
    const data =
      deactivateUserSchema.parse(
        req.body,
      );

    const result =
      await userService.deactivate(
        req.params.userId as any,
        data.reason,
        req.user!.id,
      );

    return res.status(200).json(
      result,
    );
  }

  async listOptions(req: Request, res: Response) {
  const filters = listUsersQuerySchema.parse(req.query);

  const users = await userService.listForSelect(filters);

  return res.status(200).json({
    users,
  });
}
}

export default new UserController();