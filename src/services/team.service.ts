import database from '../database/knex.js';

type CreateTeamData = {
  name: string;
  description?: string | null;
  managerId?: string | null;
  coordinatorId?: string | null;
};

class TeamService {
  async create(
    data: CreateTeamData,
    createdBy: string,
  ) {
    if (data.managerId) {
      const manager = await database('users')
        .where('id', data.managerId)
        .where('is_active', true)
        .first([
          'id',
          'role',
        ]);

      if (!manager) {
        throw new Error(
          'Manager not found',
        );
      }

      if (manager.role !== 'MANAGER') {
        throw new Error(
          'Selected user is not a manager',
        );
      }
    }

    if (data.coordinatorId) {
      const coordinator =
        await database('users')
          .where('id', data.coordinatorId)
          .where('is_active', true)
          .first([
            'id',
            'role',
          ]);

      if (!coordinator) {
        throw new Error(
          'Coordinator not found',
        );
      }

      if (
        coordinator.role !==
        'COORDINATOR'
      ) {
        throw new Error(
          'Selected user is not a coordinator',
        );
      }
    }

    const [team] = await database('teams')
      .insert({
        name: data.name,
        description:
          data.description ?? null,
        manager_id:
          data.managerId ?? null,
        coordinator_id:
          data.coordinatorId ?? null,
        created_by: createdBy,
        updated_by: createdBy,
      })
      .returning([
        'id',
        'name',
        'description',
        'manager_id',
        'coordinator_id',
        'is_active',
        'created_at',
        'created_by',
        'updated_at',
        'updated_by',
      ]);

    return team;
  }

  async list() {
  return database('teams as t')
    .leftJoin(
      'users as m',
      'm.id',
      't.manager_id',
    )
    .leftJoin(
      'users as c',
      'c.id',
      't.coordinator_id',
    )
    .select(
      't.id',
      't.name',
      't.description',
      't.is_active',
      't.created_at',
      't.updated_at',
      'm.id as manager_id',
      'm.name as manager_name',
      'c.id as coordinator_id',
      'c.name as coordinator_name',
    )
    .orderBy('t.name', 'asc');
}

async findById(teamId: string) {
  const team =
    await database('teams as t')
      .leftJoin(
        'users as m',
        'm.id',
        't.manager_id',
      )
      .leftJoin(
        'users as c',
        'c.id',
        't.coordinator_id',
      )
      .where('t.id', teamId)
      .select(
        't.id',
        't.name',
        't.description',
        't.is_active',
        't.created_at',
        't.updated_at',
        't.deactivated_at',
        'm.id as manager_id',
        'm.name as manager_name',
        'c.id as coordinator_id',
        'c.name as coordinator_name',
      )
      .first();

  if (!team) {
    throw new Error('Team not found');
  }

  return team;
}

async update(
  teamId: string,
  data: {
    name?: string;
    description?: string | null;
  },
  updatedBy: string,
) {
  const team =
    await database('teams')
      .where('id', teamId)
      .first();

  if (!team) {
    throw new Error('Team not found');
  }

  if (!team.is_active) {
    throw new Error(
      'Cannot update an inactive team',
    );
  }

  const [updatedTeam] =
    await database('teams')
      .where('id', teamId)
      .update({
        ...(data.name !== undefined && {
          name: data.name,
        }),

        ...(data.description !== undefined && {
          description: data.description,
        }),

        updated_at: database.fn.now(),
        updated_by: updatedBy,
      })
      .returning([
        'id',
        'name',
        'description',
        'manager_id',
        'coordinator_id',
        'is_active',
        'created_at',
        'created_by',
        'updated_at',
        'updated_by',
      ]);

  return updatedTeam;
}


async assignManager(
  teamId: string,
  managerId: string,
  updatedBy: string,
) {
  const team =
    await database('teams')
      .where('id', teamId)
      .first();

  if (!team) {
    throw new Error('Team not found');
  }

  if (!team.is_active) {
    throw new Error(
      'Cannot assign manager to an inactive team',
    );
  }

  const manager =
    await database('users')
      .where('id', managerId)
      .where('is_active', true)
      .first([
        'id',
        'role',
      ]);

  if (!manager) {
    throw new Error('Manager not found');
  }

  if (manager.role !== 'MANAGER') {
    throw new Error(
      'Selected user is not a manager',
    );
  }

  const [updatedTeam] =
    await database('teams')
      .where('id', teamId)
      .update({
        manager_id: managerId,
        updated_at: database.fn.now(),
        updated_by: updatedBy,
      })
      .returning([
        'id',
        'name',
        'manager_id',
        'coordinator_id',
        'is_active',
      ]);

  return updatedTeam;
}

async assignCoordinator(
  teamId: string,
  coordinatorId: string,
  updatedBy: string,
) {
  const team =
    await database('teams')
      .where('id', teamId)
      .first();

  if (!team) {
    throw new Error('Team not found');
  }

  if (!team.is_active) {
    throw new Error(
      'Cannot assign coordinator to an inactive team',
    );
  }

  const coordinator =
    await database('users')
      .where('id', coordinatorId)
      .where('is_active', true)
      .first([
        'id',
        'role',
      ]);

  if (!coordinator) {
    throw new Error(
      'Coordinator not found',
    );
  }

  if (
    coordinator.role !==
    'COORDINATOR'
  ) {
    throw new Error(
      'Selected user is not a coordinator',
    );
  }

  const [updatedTeam] =
    await database('teams')
      .where('id', teamId)
      .update({
        coordinator_id:
          coordinatorId,
        updated_at: database.fn.now(),
        updated_by: updatedBy,
      })
      .returning([
        'id',
        'name',
        'manager_id',
        'coordinator_id',
        'is_active',
      ]);

  return updatedTeam;
}

async deactivate(
  teamId: string,
  reason: string,
  deactivatedBy: string,
) {
  const team =
    await database('teams')
      .where('id', teamId)
      .first();

  if (!team) {
    throw new Error('Team not found');
  }

  if (!team.is_active) {
    throw new Error(
      'Team is already inactive',
    );
  }

  const [updatedTeam] =
    await database('teams')
      .where('id', teamId)
      .update({
        is_active: false,
        deactivated_at:
          database.fn.now(),
        deactivated_by:
          deactivatedBy,
        updated_at:
          database.fn.now(),
        updated_by:
          deactivatedBy,
      })
      .returning([
        'id',
        'name',
        'description',
        'manager_id',
        'coordinator_id',
        'is_active',
        'deactivated_at',
        'deactivated_by',
      ]);

  return {
    team: updatedTeam,
    reason,
  };
}


}

export default new TeamService();