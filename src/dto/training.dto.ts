export interface CreateTrainingDTO {
  name: string;
  description?: string | null;
  type: 'MANDATORY' | 'OPTIONAL';
}

export interface TrainingResponseDTO {
  id: string;
  name: string;
  description: string | null;
  type: 'MANDATORY' | 'OPTIONAL';
  isActive: boolean;
  createdAt: Date;
}

export interface AssociateTrainingTeamDTO {
  teamId: string;
}

export interface CreateTrainingSessionDTO {
  trainingId: string;
  startAt: string;
  endAt: string;
  location?: string | null;
  notes?: string | null;
}

export interface TrainingSessionResponseDTO {
  id: string;
  trainingId: string;
  startAt: Date;
  endAt: Date;
  location: string | null;
  notes: string | null;
  isCancelled: boolean;
  cancelledAt: Date | null;
}

export interface AddTrainingParticipantDTO {
  userId: string;
}

export interface TrainingParticipantResponseDTO {
  id: string;
  trainingSessionId: string;
  userId: string;
  participationStatus: 'PARTICIPATED' | 'ABSENT';
  evaluation: 'POOR' | 'GOOD' | 'VERY_GOOD' | null;
  attendanceRecordedAt: Date | null;
  evaluatedAt: Date | null;
  createdAt: Date;
}

export interface TechnicianTrainingDTO {
  trainingId: string;
  trainingName: string;
  trainingDescription: string | null;
  trainingType: 'MANDATORY' | 'OPTIONAL';

  sessionId: string;
  startAt: Date;
  endAt: Date;
  location: string | null;

  participationStatus: 'PARTICIPATED' | 'ABSENT';
}

export interface RecordAttendanceDTO {
  status: 'PARTICIPATED' | 'ABSENT';
}

export interface RecordEvaluationDTO {
  evaluation: 'POOR' | 'GOOD' | 'VERY_GOOD';
}

export interface TechnicianTrainingHistoryDTO {
  trainingId: string;
  trainingName: string;
  trainingType: 'MANDATORY' | 'OPTIONAL';

  sessionId: string;
  startAt: Date;
  endAt: Date;

  participationStatus: 'PARTICIPATED' | 'ABSENT';
  evaluation: 'POOR' | 'GOOD' | 'VERY_GOOD' | null;
}

export interface TrainingSessionListItemDTO {
  id: string;
  trainingId: string;
  startAt: Date;
  endAt: Date;
  location: string | null;
  notes: string | null;
  isCancelled: boolean;
  cancelledAt: Date | null;
  cancellationReason: string | null;
}

export interface RescheduleTrainingSessionDTO {
  startAt: string;
  endAt: string;
  reason?: string | null;
}

export interface CancelTrainingSessionDTO {
  reason: string;
}

export interface TechnicianTrainingTodoDTO {
  trainingId: string;
  trainingName: string;
  type: 'MANDATORY' | 'OPTIONAL';
  session: {
    id: string;
    startAt: Date;
    endAt: Date;
    location: string | null;
  };

  
}

export interface SessionParticipantListItemDTO {
  id: string;
  trainingSessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  teamId: string | null;
  teamName: string | null;
  participationStatus: 'PARTICIPATED' | 'ABSENT';
  evaluation: 'POOR' | 'GOOD' | 'VERY_GOOD' | null;
  attendanceRecordedAt: Date | null;
  evaluatedAt: Date | null;
  createdAt: Date;
}


