import database from '../database/knex.js';

import type {
  CreateTrainingDTO,
  CreateTrainingSessionDTO,
  RescheduleTrainingSessionDTO,
  TechnicianTrainingDTO,
  TechnicianTrainingHistoryDTO,
  TechnicianTrainingTodoDTO,
  TrainingParticipantResponseDTO,
  TrainingResponseDTO,
  TrainingSessionListItemDTO,
  TrainingSessionResponseDTO,
} from '../dto/training.dto.js';

class TrainingService {
  async create(
    data: CreateTrainingDTO,
    userId: string,
  ) {
    const [training] = await database('trainings')
      .insert({
        name: data.name,
        description: data.description ?? null,
        type: data.type,
        is_active: true,
        created_by: userId,
        updated_by: userId,
      })
      .returning([
        'id',
        'name',
        'description',
        'type',
        'is_active',
        'created_at',
        'created_by',
        'updated_at',
        'updated_by',
      ]);

    return training;
  }

  async list(): Promise<TrainingResponseDTO[]> {
    const trainings = await database('trainings')
      .select(
        'id',
        'name',
        'description',
        'type',
        'is_active',
        'created_at',
      )
      .where('is_active', true)
      .orderBy('name', 'asc');

    return trainings.map((training) => ({
      id: training.id,
      name: training.name,
      description: training.description,
      type: training.type,
      isActive: training.is_active,
      createdAt: training.created_at,
    }));
  }

  async associateTeam(
  trainingId: string,
  teamId: string,
  userId: string,
) {
  const training = await database('trainings')
    .where({
      id: trainingId,
    })
    .first();

  if (!training) {
    throw new Error('Training not found');
  }

  const team = await database('teams')
    .where({
      id: teamId,
      is_active: true,
    })
    .first();

  if (!team) {
    throw new Error('Team not found');
  }

  const existingAssociation = await database('training_teams')
    .where({
      training_id: trainingId,
      team_id: teamId,
    })
    .first();

  if (existingAssociation) {
    throw new Error(
      'Training is already associated with this team',
    );
  }

  const [association] = await database('training_teams')
    .insert({
      training_id: trainingId,
      team_id: teamId,
      created_by: userId,
    })
    .returning([
      'id',
      'training_id',
      'team_id',
      'created_by',
      'created_at',
    ]);

  return association;
}

async createSession(
  data: CreateTrainingSessionDTO,
  userId: string,
): Promise<TrainingSessionResponseDTO> {
  const training = await database('trainings')
    .where({
      id: data.trainingId,
      is_active: true,
    })
    .first();

  if (!training) {
    throw new Error('Training not found');
  }

  const [session] = await database('training_sessions')
    .insert({
      training_id: data.trainingId,
      start_at: data.startAt,
      end_at: data.endAt,
      location: data.location ?? null,
      notes: data.notes ?? null,
      is_cancelled: false,
      created_by: userId,
      updated_by: userId,
    })
    .returning([
      'id',
      'training_id',
      'start_at',
      'end_at',
      'location',
      'notes',
      'is_cancelled',
      'cancelled_at',
    ]);

  return {
    id: session.id,
    trainingId: session.training_id,
    startAt: session.start_at,
    endAt: session.end_at,
    location: session.location,
    notes: session.notes,
    isCancelled: session.is_cancelled,
    cancelledAt: session.cancelled_at,
  };
}

async addParticipant(
  sessionId: string,
  userId: string,
  createdBy: string,
): Promise<TrainingParticipantResponseDTO> {
  const session = await database('training_sessions as ts')
    .join('trainings as t', 't.id', 'ts.training_id')
    .where('ts.id', sessionId)
    .select(
      'ts.id',
      'ts.training_id',
      'ts.is_cancelled',
    )
    .first();

  if (!session) {
    throw new Error('Training session not found');
  }

  if (session.is_cancelled) {
    throw new Error('Cannot add participant to a cancelled session');
  }

  const user = await database('users')
    .where({
      id: userId,
      is_active: true,
    })
    .select(
      'id',
      'role',
      'team_id',
    )
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  if (user.role !== 'TECHNICIAN') {
    throw new Error(
      'Only technicians can be added as training participants',
    );
  }

  if (!user.team_id) {
    throw new Error(
      'Technician must belong to a team',
    );
  }

  const teamAssociation = await database('training_teams')
    .where({
      training_id: session.training_id,
      team_id: user.team_id,
    })
    .first();

  if (!teamAssociation) {
    throw new Error(
      'Technician team is not associated with this training',
    );
  }

  const existingParticipant = await database(
    'training_participants',
  )
    .where({
      training_session_id: sessionId,
      user_id: userId,
    })
    .first();

  if (existingParticipant) {
    throw new Error(
      'Technician is already registered for this training session',
    );
  }

  const [participant] = await database(
    'training_participants',
  )
    .insert({
      training_session_id: sessionId,
      user_id: userId,
      participation_status: 'ABSENT',
      evaluation: null,
      created_by: createdBy,
      updated_by: createdBy,
    })
    .returning([
      'id',
      'training_session_id',
      'user_id',
      'participation_status',
      'evaluation',
      'attendance_recorded_at',
      'evaluated_at',
      'created_at',
    ]);

  return {
    id: participant.id,
    trainingSessionId: participant.training_session_id,
    userId: participant.user_id,
    participationStatus: participant.participation_status,
    evaluation: participant.evaluation,
    attendanceRecordedAt: participant.attendance_recorded_at,
    evaluatedAt: participant.evaluated_at,
    createdAt: participant.created_at,
  };
}

async listTechnicianTrainings(
  userId: string,
): Promise<TechnicianTrainingDTO[]> {
  const trainings = await database('training_participants as tp')
    .join(
      'training_sessions as ts',
      'ts.id',
      'tp.training_session_id',
    )
    .join(
      'trainings as t',
      't.id',
      'ts.training_id',
    )
    .where('tp.user_id', userId)
    .where('ts.is_cancelled', false)
    .where('ts.start_at', '>', database.fn.now())
    .select(
      't.id as training_id',
      't.name as training_name',
      't.description as training_description',
      't.type as training_type',
      'ts.id as session_id',
      'ts.start_at',
      'ts.end_at',
      'ts.location',
      'tp.participation_status',
    )
    .orderBy('ts.start_at', 'asc');

  return trainings.map((training) => ({
    trainingId: training.training_id,
    trainingName: training.training_name,
    trainingDescription: training.training_description,
    trainingType: training.training_type,
    sessionId: training.session_id,
    startAt: training.start_at,
    endAt: training.end_at,
    location: training.location,
    participationStatus: training.participation_status,
  }));
}

async recordAttendance(
  participantId: string,
  participationStatus: 'PARTICIPATED' | 'ABSENT',
  changedBy: string,
) {
  return database.transaction(async (trx) => {
    const participant = await trx(
      'training_participants',
    )
      .where('id', participantId)
      .first();

    if (!participant) {
      throw new Error('Training participant not found');
    }

    const oldStatus = participant.participation_status;
    const oldEvaluation = participant.evaluation;

    const updateData: Record<string, unknown> = {
      participation_status: participationStatus,
      attendance_recorded_at: trx.fn.now(),
      attendance_recorded_by: changedBy,
      updated_at: trx.fn.now(),
      updated_by: changedBy,
    };

    /**
     * If the technician is marked as absent,
     * any existing evaluation must be removed.
     */
    if (participationStatus === 'ABSENT') {
      updateData.evaluation = null;
      updateData.evaluated_at = null;
      updateData.evaluated_by = null;
    }

    const [updatedParticipant] = await trx(
      'training_participants',
    )
      .where('id', participantId)
      .update(updateData)
      .returning('*');

    await trx('training_participant_history').insert({
      training_participant_id: participantId,
      action: 'ATTENDANCE_UPDATED',
      old_participation_status: oldStatus,
      new_participation_status: participationStatus,
      old_evaluation: oldEvaluation,
      new_evaluation:
        participationStatus === 'ABSENT'
          ? null
          : oldEvaluation,
      changed_by: changedBy,
    });

    return updatedParticipant;
  });
}

async recordEvaluation(
  participantId: string,
  evaluation: 'POOR' | 'GOOD' | 'VERY_GOOD',
  changedBy: string,
) {
  const participant = await database(
    'training_participants as tp',
  )
    .join(
      'training_sessions as ts',
      'ts.id',
      'tp.training_session_id',
    )
    .where('tp.id', participantId)
    .select(
      'tp.id',
      'tp.training_session_id',
      'tp.user_id',
      'tp.participation_status',
      'tp.evaluation',
      'ts.is_cancelled',
      'ts.end_at',
    )
    .first();

  if (!participant) {
    throw new Error('Training participant not found');
  }

  if (participant.is_cancelled) {
    throw new Error(
      'Cannot evaluate a cancelled training session',
    );
  }

  if (new Date(participant.end_at) > new Date()) {
    throw new Error(
      'Cannot evaluate before the training session ends',
    );
  }

  if (participant.participation_status !== 'PARTICIPATED') {
    throw new Error(
      'Only participants who attended the training can be evaluated',
    );
  }

  const oldEvaluation = participant.evaluation;

  const [updatedParticipant] = await database(
    'training_participants',
  )
    .where('id', participantId)
    .update({
      evaluation,
      evaluated_at: database.fn.now(),
      evaluated_by: changedBy,
      updated_at: database.fn.now(),
      updated_by: changedBy,
    })
    .returning([
      'id',
      'training_session_id',
      'user_id',
      'participation_status',
      'evaluation',
      'attendance_recorded_at',
      'evaluated_at',
      'created_at',
    ]);

  await database('training_participant_history').insert({
    training_participant_id: participantId,
    action: 'EVALUATION_RECORDED',
    old_participation_status:
      participant.participation_status,
    new_participation_status:
      updatedParticipant.participation_status,
    old_evaluation: oldEvaluation,
    new_evaluation: evaluation,
    reason: null,
    changed_by: changedBy,
  });

  return updatedParticipant;
}

async listTechnicianTrainingHistory(
  userId: string,
): Promise<TechnicianTrainingHistoryDTO[]> {
  const history = await database(
    'training_participants as tp',
  )
    .join(
      'training_sessions as ts',
      'ts.id',
      'tp.training_session_id',
    )
    .join(
      'trainings as t',
      't.id',
      'ts.training_id',
    )
    .where('tp.user_id', userId)
    .where('ts.end_at', '<=', database.fn.now())
    .select(
      't.id as training_id',
      't.name as training_name',
      't.type',

      'ts.id as session_id',
      'ts.start_at',
      'ts.end_at',
      'ts.location',

      'tp.participation_status',
      'tp.evaluation',
    )
    .orderBy('ts.start_at', 'desc');

  return history.map((item) => ({
  trainingId: item.training_id,
  trainingName: item.training_name,
  trainingType: item.type,
  sessionId: item.session_id,
  startAt: item.start_at,
  endAt: item.end_at,
  location: item.location,
  participationStatus: item.participation_status,
  evaluation: item.evaluation,
}));
}

async listTrainingSessions(
  trainingId: string,
): Promise<TrainingSessionListItemDTO[]> {
  const training = await database('trainings')
    .where('id', trainingId)
    .first();

  if (!training) {
    throw new Error('Training not found');
  }

  const sessions = await database('training_sessions')
    .where('training_id', trainingId)
    .select(
      'id',
      'training_id',
      'start_at',
      'end_at',
      'location',
      'notes',
      'is_cancelled',
      'cancelled_at',
      'cancellation_reason',
    )
    .orderBy('start_at', 'asc');

  return sessions.map((session) => ({
    id: session.id,
    trainingId: session.training_id,
    startAt: session.start_at,
    endAt: session.end_at,
    location: session.location,
    notes: session.notes,
    isCancelled: session.is_cancelled,
    cancelledAt: session.cancelled_at,
    cancellationReason: session.cancellation_reason,
  }));
}

async rescheduleTrainingSession(
  sessionId: string,
  data: RescheduleTrainingSessionDTO,
  changedBy: string,
) {
  const session = await database(
    'training_sessions',
  )
    .where('id', sessionId)
    .first();

  if (!session) {
    throw new Error('Training session not found');
  }

  if (session.is_cancelled) {
    throw new Error(
      'Cannot reschedule a cancelled training session',
    );
  }

  const oldStartAt = session.start_at;
  const oldEndAt = session.end_at;

  const [updatedSession] = await database(
    'training_sessions',
  )
    .where('id', sessionId)
    .update({
      start_at: data.startAt,
      end_at: data.endAt,
      updated_at: database.fn.now(),
      updated_by: changedBy,
    })
    .returning([
      'id',
      'training_id',
      'start_at',
      'end_at',
      'location',
      'notes',
      'is_cancelled',
      'cancelled_at',
      'cancellation_reason',
    ]);

  await database(
    'training_session_history',
  ).insert({
    training_session_id: sessionId,
    action: 'RESCHEDULED',
    old_start_at: oldStartAt,
    old_end_at: oldEndAt,
    new_start_at: data.startAt,
    new_end_at: data.endAt,
    reason: data.reason ?? null,
    changed_by: changedBy,
  });

  return updatedSession;
}

async cancelTrainingSession(
  sessionId: string,
  reason: string,
  changedBy: string,
) {
  return database.transaction(async (trx) => {
    const session = await trx(
      'training_sessions',
    )
      .where('id', sessionId)
      .first();

    if (!session) {
      throw new Error(
        'Training session not found',
      );
    }

    if (session.is_cancelled) {
      throw new Error(
        'Training session is already cancelled',
      );
    }

    if (
      new Date(session.start_at) <=
      new Date()
    ) {
      throw new Error(
        'Cannot cancel a training session that has already started',
      );
    }

    const [updatedSession] = await trx(
      'training_sessions',
    )
      .where('id', sessionId)
      .update({
        is_cancelled: true,
        cancelled_at: trx.fn.now(),
        cancelled_by: changedBy,
        cancellation_reason: reason,
        updated_at: trx.fn.now(),
        updated_by: changedBy,
      })
      .returning([
        'id',
        'training_id',
        'start_at',
        'end_at',
        'location',
        'notes',
        'is_cancelled',
        'cancelled_at',
        'cancelled_by',
        'cancellation_reason',
        'created_at',
        'created_by',
        'updated_at',
        'updated_by',
      ]);

    await trx(
      'training_session_history',
    ).insert({
      training_session_id: sessionId,
      action: 'CANCELLED',
      old_start_at: session.start_at,
      old_end_at: session.end_at,
      new_start_at: session.start_at,
      new_end_at: session.end_at,
      reason,
      changed_by: changedBy,
    });

    return updatedSession;
  });
}

 async listTechnicianTodoTrainings(
  userId: string,
): Promise<TechnicianTrainingTodoDTO[]> {
  const sessions = await database(
    'training_participants as tp',
  )
    .join(
      'training_sessions as ts',
      'ts.id',
      'tp.training_session_id',
    )
    .join(
      'trainings as t',
      't.id',
      'ts.training_id',
    )
    .where('tp.user_id', userId)
    .where('ts.is_cancelled', false)
    .where('ts.start_at', '>', database.fn.now())
    .select(
      't.id as training_id',
      't.name as training_name',
      't.type',
      'ts.id as session_id',
      'ts.start_at',
      'ts.end_at',
      'ts.location',
    )
    .orderBy('ts.start_at', 'asc');

  return sessions.map((session) => ({
    trainingId: session.training_id,
    trainingName: session.training_name,
    type: session.type,
    session: {
      id: session.session_id,
      startAt: session.start_at,
      endAt: session.end_at,
      location: session.location,
    },
  }));
}

async listSessionParticipants(sessionId: string) {
  const session = await database('training_sessions')
    .where('id', sessionId)
    .first();

  if (!session) {
    throw new Error('Training session not found');
  }

  const participants = await database(
    'training_participants as tp',
  )
    .join('users as u', 'u.id', 'tp.user_id')
    .leftJoin('teams as tm', 'tm.id', 'u.team_id')
    .where('tp.training_session_id', sessionId)
    .select(
      'tp.id',
      'tp.training_session_id',
      'tp.user_id',
      'tp.participation_status',
      'tp.evaluation',
      'tp.attendance_recorded_at',
      'tp.evaluated_at',
      'tp.created_at',
      'u.name as user_name',
      'u.email as user_email',
      'tm.id as team_id',
      'tm.name as team_name',
    )
    .orderBy('u.name', 'asc');

  return participants.map((participant) => ({
    id: participant.id,
    trainingSessionId: participant.training_session_id,
    userId: participant.user_id,
    userName: participant.user_name,
    userEmail: participant.user_email,
    teamId: participant.team_id,
    teamName: participant.team_name,
    participationStatus: participant.participation_status,
    evaluation: participant.evaluation,
    attendanceRecordedAt: participant.attendance_recorded_at,
    evaluatedAt: participant.evaluated_at,
    createdAt: participant.created_at,
  }));
}

}

export default new TrainingService();
