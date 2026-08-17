import database from '../database/knex.js';

class DashboardService {
  async getManagerDashboard() {
    const now = database.fn.now();

    const [
      teamsResult,
      techniciansResult,
      trainingsResult,
      mandatoryTrainingsResult,
      completedSessionsResult,
      participationResult,
      evaluationResult,
      mandatoryComplianceResult,
      teamResult,
    ] = await Promise.all([
      // Total de equipes ativas
      database('teams')
        .where('is_active', true)
        .count<{ count: string }>('id as count')
        .first(),

      // Total de técnicos ativos
      database('users')
        .where('role', 'TECHNICIAN')
        .where('is_active', true)
        .count<{ count: string }>('id as count')
        .first(),

      // Total de treinamentos ativos
      database('trainings')
        .where('is_active', true)
        .count<{ count: string }>('id as count')
        .first(),

      // Total de treinamentos obrigatórios ativos
      database('trainings')
        .where('is_active', true)
        .where('type', 'MANDATORY')
        .count<{ count: string }>('id as count')
        .first(),

      // Sessões concluídas
      database('training_sessions')
        .where('end_at', '<=', now)
        .where('is_cancelled', false)
        .count<{ count: string }>('id as count')
        .first(),

      // Participação geral
      database('training_participants')
        .select(
          database.raw(`
            COUNT(*) FILTER (
              WHERE participation_status = 'PARTICIPATED'
            ) AS participated,
            COUNT(*) AS total
          `),
        )
        .first(),

      // Avaliações
      database('training_participants')
        .whereNotNull('evaluation')
        .select(
          database.raw(`
            COUNT(*) FILTER (
              WHERE evaluation = 'POOR'
            ) AS poor,
            COUNT(*) FILTER (
              WHERE evaluation = 'GOOD'
            ) AS good,
            COUNT(*) FILTER (
              WHERE evaluation = 'VERY_GOOD'
            ) AS very_good
          `),
        )
        .first(),

      // Cumprimento dos treinamentos obrigatórios
      database('training_participants as tp')
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
        .where('t.type', 'MANDATORY')
        .where('ts.is_cancelled', false)
        .where('ts.end_at', '<=', now)
        .select(
          database.raw(`
            COUNT(*) FILTER (
              WHERE tp.participation_status = 'PARTICIPATED'
            ) AS completed,
            COUNT(*) AS total
          `),
        )
        .first(),

      // Indicadores por equipe
      database('teams as tm')
        .leftJoin(
          'users as u',
          function () {
            this.on('u.team_id', '=', 'tm.id')
              .andOn(
                'u.role',
                '=',
                database.raw('?', ['TECHNICIAN']),
              )
              .andOn(
                'u.is_active',
                '=',
                database.raw('?', [true]),
              );
          },
        )
        .leftJoin(
          'training_participants as tp',
          'tp.user_id',
          'u.id',
        )
        .where('tm.is_active', true)
        .groupBy('tm.id', 'tm.name')
        .select(
          'tm.id as team_id',
          'tm.name as team_name',

          database.raw(`
            COUNT(DISTINCT u.id) AS technicians
          `),

          database.raw(`
            COUNT(tp.id) AS participants
          `),

          database.raw(`
            COUNT(tp.id) FILTER (
              WHERE tp.participation_status = 'PARTICIPATED'
            ) AS participated
          `),

          database.raw(`
            COUNT(tp.id) FILTER (
              WHERE tp.participation_status = 'ABSENT'
            ) AS absent
          `),

          database.raw(`
            COUNT(tp.id) FILTER (
              WHERE tp.evaluation = 'POOR'
            ) AS poor,

            COUNT(tp.id) FILTER (
              WHERE tp.evaluation = 'GOOD'
            ) AS good,

            COUNT(tp.id) FILTER (
              WHERE tp.evaluation = 'VERY_GOOD'
            ) AS very_good
          `),
        )
        .orderBy('tm.name', 'asc'),
    ]);

    const teams = Number(teamsResult?.count ?? 0);
    const technicians = Number(techniciansResult?.count ?? 0);
    const totalTrainings = Number(trainingsResult?.count ?? 0);
    const mandatoryTrainings = Number(
      mandatoryTrainingsResult?.count ?? 0,
    );

    const completedSessions = Number(
      completedSessionsResult?.count ?? 0,
    );

    const participationTotal = Number(
      participationResult?.total ?? 0,
    );

    const participated = Number(
      participationResult?.participated ?? 0,
    );

    const participationRate =
      participationTotal > 0
        ? Number(
            (
              (participated / participationTotal) *
              100
            ).toFixed(1),
          )
        : 0;

    const absenceRate =
      participationTotal > 0
        ? Number(
            (
              ((participationTotal - participated) /
                participationTotal) *
              100
            ).toFixed(1),
          )
        : 0;

    const poor = Number(
      evaluationResult?.poor ?? 0,
    );

    const good = Number(
      evaluationResult?.good ?? 0,
    );

    const veryGood = Number(
      evaluationResult?.very_good ?? 0,
    );

    const evaluatedTotal =
      poor + good + veryGood;

    const averageEvaluation =
      evaluatedTotal > 0
        ? Number(
            (
              (poor * 1 +
                good * 2 +
                veryGood * 3) /
              evaluatedTotal
            ).toFixed(2),
          )
        : 0;

    const mandatoryCompleted = Number(
      mandatoryComplianceResult?.completed ?? 0,
    );

    const mandatoryTotal = Number(
      mandatoryComplianceResult?.total ?? 0,
    );

    const mandatoryComplianceRate =
      mandatoryTotal > 0
        ? Number(
            (
              (mandatoryCompleted /
                mandatoryTotal) *
              100
            ).toFixed(1),
          )
        : 0;

    return {
      summary: {
        teams,
        technicians,
        totalTrainings,
        mandatoryTrainings,
        completedSessions,
        participationRate,
        absenceRate,
        averageEvaluation,
        mandatoryComplianceRate,
      },

      evaluations: {
        poor,
        good,
        veryGood,
        total: evaluatedTotal,
      },

      byTeam: teamResult.map((team) => {
        const teamParticipants = Number(
          team.participants ?? 0,
        );

        const teamParticipated = Number(
          team.participated ?? 0,
        );

        const teamAbsent = Number(
          team.absent ?? 0,
        );

        const teamPoor = Number(
          team.poor ?? 0,
        );

        const teamGood = Number(
          team.good ?? 0,
        );

        const teamVeryGood = Number(
          team.very_good ?? 0,
        );

        const teamEvaluated =
          teamPoor +
          teamGood +
          teamVeryGood;

        return {
          teamId: team.team_id,
          teamName: team.team_name,
          technicians: Number(
            team.technicians ?? 0,
          ),
          participants: teamParticipants,

          participationRate:
            teamParticipants > 0
              ? Number(
                  (
                    (teamParticipated /
                      teamParticipants) *
                    100
                  ).toFixed(1),
                )
              : 0,

          absenceRate:
            teamParticipants > 0
              ? Number(
                  (
                    (teamAbsent /
                      teamParticipants) *
                    100
                  ).toFixed(1),
                )
              : 0,

          averageEvaluation:
            teamEvaluated > 0
              ? Number(
                  (
                    (teamPoor * 1 +
                      teamGood * 2 +
                      teamVeryGood * 3) /
                    teamEvaluated
                  ).toFixed(2),
                )
              : 0,
        };
      }),
    };
  }
}

export default new DashboardService();