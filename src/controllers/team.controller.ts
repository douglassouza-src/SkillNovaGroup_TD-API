import type {
  Request,
  Response,
} from 'express';

import teamService from '../services/team.service.js';
import {
    assignTeamCoordinatorSchema,
  assignTeamManagerSchema,
  createTeamSchema,
  deactivateTeamSchema,
  updateTeamSchema,
} from '../zod/team.zod.js';

class TeamController {
  async create(
    req: Request,
    res: Response,
  ) {
    const data =
      createTeamSchema.parse(
        req.body,
      );

    const team =
      await teamService.create(
        data,
        req.user!.id,
      );

    return res.status(201).json({
      team,
    });
  }

  async list(
  _req: Request,
  res: Response,
) {
  const teams =
    await teamService.list();

  return res.status(200).json({
    teams,
  });
}

async findById(
  req: Request,
  res: Response,
) {
  const team =
    await teamService.findById(
      req.params.teamId as any,
    );

  return res.status(200).json({
    team,
  });
}

async update(
  req: Request,
  res: Response,
) {
  const data =
    updateTeamSchema.parse(
      req.body,
    );

  const team =
    await teamService.update(
      req.params.teamId as any,
      data,
      req.user!.id,
    );

  return res.status(200).json({
    team,
  });
}


async assignManager(
  req: Request,
  res: Response,
) {
  const data =
    assignTeamManagerSchema.parse(
      req.body,
    );

  const team =
    await teamService.assignManager(
      req.params.teamId as any,
      data.managerId,
      req.user!.id,
    );

  return res.status(200).json({
    team,
  });
}


async assignCoordinator(
  req: Request,
  res: Response,
) {
  const data =
    assignTeamCoordinatorSchema.parse(
      req.body,
    );

  const team =
    await teamService.assignCoordinator(
      req.params.teamId as any,
      data.coordinatorId,
      req.user!.id,
    );

  return res.status(200).json({
    team,
  });
}


async deactivate(
  req: Request,
  res: Response,
) {
  const data =
    deactivateTeamSchema.parse(
      req.body,
    );

  const result =
    await teamService.deactivate(
      req.params.teamId as any,
      data.reason,
      req.user!.id,
    );

  return res.status(200).json(result);
}
}

export default new TeamController();