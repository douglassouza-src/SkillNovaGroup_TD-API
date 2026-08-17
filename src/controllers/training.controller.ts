import type { Request, Response } from 'express';

import trainingService from '../services/training.service.js';
import { addTrainingParticipantSchema, associateTrainingTeamSchema, cancelTrainingSessionSchema, createTrainingSchema, createTrainingSessionSchema, recordAttendanceSchema, recordEvaluationSchema, rescheduleTrainingSessionSchema } from '../zod/training.zod.js';

class TrainingController {
  async create(req: Request, res: Response) {
    const data = createTrainingSchema.parse(req.body);

    const training = await trainingService.create(
      data,
      req.user!.id,
    );

    return res.status(201).json({
      training,
    });
  }

  async list(req: Request, res: Response) {
    const trainings = await trainingService.list();

    return res.status(200).json({
      trainings,
    });
  }

  async associateTeam(req: Request, res: Response) {
  const data = associateTrainingTeamSchema.parse(req.body);

  const association = await trainingService.associateTeam(
    req.params.trainingId as any,
    data.teamId,
    req.user!.id,
  );

  return res.status(201).json({
    association,
  });
}

async createSession(req: Request, res: Response) {
  const data = createTrainingSessionSchema.parse(req.body);

  const session = await trainingService.createSession(
    data,
    req.user!.id,
  );

  return res.status(201).json({
    session,
  });
}

async addParticipant(req: Request, res: Response) {
  const data = addTrainingParticipantSchema.parse(req.body);

  const participant = await trainingService.addParticipant(
    req.params.sessionId as any,
    data.userId,
    req.user!.id,
  );

  return res.status(201).json({
    participant,
  });
}

async listTechnicianTrainings(
  req: Request,
  res: Response,
) {
  const trainings =
    await trainingService.listTechnicianTrainings(
      req.user!.id,
    );

  return res.status(200).json({
    trainings,
  });
}

async recordAttendance(
  req: Request,
  res: Response,
) {
  const { participantId } = req.params;

  const data = recordAttendanceSchema.parse(
    req.body,
  );

  const participant =
    await trainingService.recordAttendance(
      participantId as any,
      data.participationStatus as any,
      req.user!.id,
    );

  return res.status(200).json({
    participant,
  });
}

async listTrainingSessions(
  req: Request,
  res: Response,
) {
  const sessions =
    await trainingService.listTrainingSessions(
      req.params.trainingId as any,
    );

  return res.status(200).json({
    sessions,
  });
}

async rescheduleTrainingSession(
  req: Request,
  res: Response,
) {
  const data =
    rescheduleTrainingSessionSchema.parse(
      req.body,
    );

  const session =
    await trainingService.rescheduleTrainingSession(
      req.params.sessionId as any,
      data,
      req.user!.id,
    );

  return res.status(200).json({
    session,
  });
}

async cancelTrainingSession(
  req: Request,
  res: Response,
) {
  const data =
    cancelTrainingSessionSchema.parse(
      req.body,
    );

  const session =
    await trainingService.cancelTrainingSession(
      req.params.sessionId as any,
      data.reason,
      req.user!.id,
    );

  return res.status(200).json({
    session,
  });
}

 async  listMyTodoTrainings(
  req: Request,
  res: Response,
) {
  const trainings =
    await trainingService.listTechnicianTodoTrainings(
      req.user!.id,
    );

  return res.status(200).json({
    trainings,
  });
}

async listMyTrainingHistory(
  req: Request,
  res: Response,
) {
  const history =
    await trainingService
      .listTechnicianTrainingHistory(
        req.user!.id,
      );

  return res.status(200).json({
    history,
  });
}

async recordEvaluation(
  req: Request,
  res: Response,
) {
  const { participantId } = req.params;

  const data = recordEvaluationSchema.parse(
    req.body,
  );

  const participant =
    await trainingService.recordEvaluation(
      participantId as any,
      data.evaluation,
      req.user!.id,
    );

  return res.status(200).json({
    participant,
  });
}

async listSessionParticipants(
  req: Request,
  res: Response,
) {
  const participants =
    await trainingService.listSessionParticipants(
      req.params.sessionId as any,
    );

  return res.status(200).json({
    participants,
  });
}
}

export default new TrainingController();

