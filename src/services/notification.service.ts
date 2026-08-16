import database from '../database/knex.js';
import { sendDiscordMessage } from './discord.service.js';

export async function sendTrainingAlert(
  trainingSessionId: string,
  userId: string,
) {
  const session = await database(
    'training_sessions as ts',
  )
    .join(
      'trainings as t',
      't.id',
      'ts.training_id',
    )
    .join(
      'training_participants as tp',
      'tp.training_session_id',
      'ts.id',
    )
    .where('ts.id', trainingSessionId)
    .where('tp.user_id', userId)
    .select(
      'ts.id',
      'ts.start_at',
      'ts.end_at',
      'ts.location',
      'ts.is_cancelled',
      't.name as training_name',
    )
    .first();

  if (!session) {
    throw new Error(
      'Training session not found or technician is not registered',
    );
  }

  if (session.is_cancelled) {
    throw new Error(
      'Cannot send an alert for a cancelled training session',
    );
  }

  const startAt = new Date(session.start_at);
  const now = new Date();

  if (startAt <= now) {
    throw new Error(
      'Cannot send an alert for a training session that has already started',
    );
  }

  const message = [
    '🔔 **Treinamento próximo**',
    '',
    `**Treinamento:** ${session.training_name}`,
    `**Início:** ${startAt.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    })}`,
    `**Local:** ${session.location ?? 'Não informado'}`,
    '',
    'O treinamento acontecerá em aproximadamente 1 minuto.',
  ].join('\n');

  try {
    await sendDiscordMessage({
      content: message,
    });

    const [alert] = await database(
      'notification_alerts',
    )
      .insert({
        training_session_id: trainingSessionId,
        user_id: userId,
        channel: 'DISCORD',
        minutes_before: 1,
        destination: 'DISCORD_WEBHOOK',
        status: 'SENT',
        sent_at: database.fn.now(),
      })
      .returning([
        'id',
        'training_session_id',
        'user_id',
        'channel',
        'minutes_before',
        'status',
        'sent_at',
      ]);

    return alert;
  } catch (error) {
    await database('notification_alerts').insert({
      training_session_id: trainingSessionId,
      user_id: userId,
      channel: 'DISCORD',
      minutes_before: 1,
      destination: 'DISCORD_WEBHOOK',
      status: 'FAILED',
      error_message:
        error instanceof Error
          ? error.message
          : 'Unknown Discord error',
    });

    throw error;
  }
}