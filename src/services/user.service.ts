import bcrypt from "bcryptjs";

import database from '../database/knex.js';
import { ListUsersQuery } from "../zod/user.zod.js";
import { UserOptionDTO } from "../dto/user.dto.js";

type CreateUserData = {
  name: string;
  email: string;
  password: string;
  role:
    | 'MASTER'
    | 'MANAGER'
    | 'COORDINATOR'
    | 'TECHNICIAN';
  teamId?: string | null;
};

class UserService {
  async create(
    data: CreateUserData,
    createdBy: string,
  ) {
    const existingUser =
      await database('users')
        .where('email', data.email)
        .first();

    if (existingUser) {
      throw new Error(
        'Email is already in use',
      );
    }

    if (data.teamId) {
      const team =
        await database('teams')
          .where('id', data.teamId)
          .where('is_active', true)
          .first();

      if (!team) {
        throw new Error(
          'Team not found',
        );
      }
    }

    const passwordHash =
      await bcrypt.hash(
        data.password,
        10,
      );

    const [user] =
      await database('users')
        .insert({
          name: data.name,
          email: data.email,
          password_hash:
            passwordHash,
          role: data.role,
          team_id:
            data.teamId ?? null,
          created_by: createdBy,
          updated_by: createdBy,
        })
        .returning([
          'id',
          'name',
          'email',
          'role',
          'team_id',
          'is_active',
          'created_at',
          'created_by',
          'updated_at',
          'updated_by',
        ]);

    await database(
      'user_role_history',
    ).insert({
      user_id: user.id,
      old_role: null,
      new_role: user.role,
      old_team_id: null,
      new_team_id:
        user.team_id,
      changed_at:
        database.fn.now(),
      changed_by: createdBy,
      reason:
        'Initial user assignment',
    });

    return user;
  }

  async list() {
    return database('users as u')
      .leftJoin(
        'teams as t',
        't.id',
        'u.team_id',
      )
      .select(
        'u.id',
        'u.name',
        'u.email',
        'u.role',
        'u.team_id',
        't.name as team_name',
        'u.is_active',
        'u.created_at',
        'u.updated_at',
        'u.deactivated_at',
      )
      .orderBy(
        'u.name',
        'asc',
      );
  }


    async findById(
    userId: string,
  ) {
    const user =
      await database(
        'users as u',
      )
        .leftJoin(
          'teams as t',
          't.id',
          'u.team_id',
        )
        .where(
          'u.id',
          userId,
        )
        .select(
          'u.id',
          'u.name',
          'u.email',
          'u.role',
          'u.team_id',
          't.name as team_name',
          'u.is_active',
          'u.created_at',
          'u.created_by',
          'u.updated_at',
          'u.updated_by',
          'u.deactivated_at',
          'u.deactivated_by',
        )
        .first();

    if (!user) {
      throw new Error(
        'User not found',
      );
    }

    return user;
  }

    async update(
    userId: string,
    data: {
      name?: string;
      email?: string;
    },
    updatedBy: string,
  ) {
    const user =
      await database('users')
        .where('id', userId)
        .first();

    if (!user) {
      throw new Error(
        'User not found',
      );
    }

    if (!user.is_active) {
      throw new Error(
        'Cannot update an inactive user',
      );
    }

    if (data.email) {
      const existing =
        await database('users')
          .where(
            'email',
            data.email,
          )
          .whereNot(
            'id',
            userId,
          )
          .first();

      if (existing) {
        throw new Error(
          'Email is already in use',
        );
      }
    }

    const [updatedUser] =
      await database('users')
        .where('id', userId)
        .update({
          ...(data.name !==
            undefined && {
            name: data.name,
          }),

          ...(data.email !==
            undefined && {
            email: data.email,
          }),

          updated_at:
            database.fn.now(),
          updated_by: updatedBy,
        })
        .returning([
          'id',
          'name',
          'email',
          'role',
          'team_id',
          'is_active',
          'created_at',
          'created_by',
          'updated_at',
          'updated_by',
        ]);

    return updatedUser;
  }

    async changeRole(
  userId: string,
  newRole:
    | 'MASTER'
    | 'MANAGER'
    | 'COORDINATOR'
    | 'TECHNICIAN',
  reason: string,
  changedBy: string,
) {
  return database.transaction(
    async (trx) => {
      const user =
        await trx('users')
          .where('id', userId)
          .first();

      if (!user) {
        throw new Error(
          'User not found',
        );
      }

      if (!user.is_active) {
        throw new Error(
          'Cannot change role of an inactive user',
        );
      }

      if (
        user.role === newRole
      ) {
        throw new Error(
          'User already has this role',
        );
      }

      /**
       * A manager cannot lose the MANAGER role
       * while still being assigned as manager
       * of an active team.
       */
      if (
        user.role === 'MANAGER' &&
        newRole !== 'MANAGER'
      ) {
        const managedTeam =
          await trx('teams')
            .where(
              'manager_id',
              userId,
            )
            .where(
              'is_active',
              true,
            )
            .first('id');

        if (managedTeam) {
          throw new Error(
            'Cannot change role while user is assigned as manager of an active team',
          );
        }
      }

      /**
       * A coordinator cannot lose the COORDINATOR role
       * while still being assigned as coordinator
       * of an active team.
       */
      if (
        user.role ===
          'COORDINATOR' &&
        newRole !== 'COORDINATOR'
      ) {
        const coordinatedTeam =
          await trx('teams')
            .where(
              'coordinator_id',
              userId,
            )
            .where(
              'is_active',
              true,
            )
            .first('id');

        if (coordinatedTeam) {
          throw new Error(
            'Cannot change role while user is assigned as coordinator of an active team',
          );
        }
      }

      const oldRole =
        user.role;

      const [updatedUser] =
        await trx('users')
          .where(
            'id',
            userId,
          )
          .update({
            role: newRole,
            updated_at:
              trx.fn.now(),
            updated_by:
              changedBy,
          })
          .returning([
            'id',
            'name',
            'email',
            'role',
            'team_id',
            'is_active',
            'updated_at',
            'updated_by',
          ]);

      await trx(
        'user_role_history',
      ).insert({
        user_id: userId,
        old_role: oldRole,
        new_role: newRole,
        old_team_id:
          user.team_id,
        new_team_id:
          user.team_id,
        changed_at:
          trx.fn.now(),
        changed_by: changedBy,
        reason,
      });

      return updatedUser;
    },
  );
}

    async changeTeam(
    userId: string,
    newTeamId: string | null,
    reason: string,
    changedBy: string,
  ) {
    return database.transaction(
      async (trx) => {
        const user =
          await trx('users')
            .where('id', userId)
            .first();

        if (!user) {
          throw new Error(
            'User not found',
          );
        }

        if (!user.is_active) {
          throw new Error(
            'Cannot change team of an inactive user',
          );
        }

        if (newTeamId) {
          const team =
            await trx('teams')
              .where(
                'id',
                newTeamId,
              )
              .where(
                'is_active',
                true,
              )
              .first();

          if (!team) {
            throw new Error(
              'Team not found',
            );
          }
        }

        if (
          user.team_id ===
          newTeamId
        ) {
          throw new Error(
            'User already belongs to this team',
          );
        }

        const oldTeamId =
          user.team_id;

        const [updatedUser] =
          await trx('users')
            .where(
              'id',
              userId,
            )
            .update({
              team_id:
                newTeamId,
              updated_at:
                trx.fn.now(),
              updated_by:
                changedBy,
            })
            .returning([
              'id',
              'name',
              'email',
              'role',
              'team_id',
              'is_active',
              'updated_at',
              'updated_by',
            ]);

        await trx(
          'user_role_history',
        ).insert({
          user_id: userId,
          old_role:
            user.role,
          new_role:
            user.role,
          old_team_id:
            oldTeamId,
          new_team_id:
            newTeamId,
          changed_at:
            trx.fn.now(),
          changed_by: changedBy,
          reason,
        });

        return updatedUser;
      },
    );
  }

    async deactivate(
  userId: string,
  reason: string,
  deactivatedBy: string,
) {
  const user =
    await database('users')
      .where('id', userId)
      .first();

  if (!user) {
    throw new Error(
      'User not found',
    );
  }

  if (!user.is_active) {
    throw new Error(
      'User is already inactive',
    );
  }

  /**
   * Do not deactivate a manager
   * while they are still assigned to
   * an active team.
   */
  if (user.role === 'MANAGER') {
    const managedTeam =
      await database('teams')
        .where(
          'manager_id',
          userId,
        )
        .where(
          'is_active',
          true,
        )
        .first('id');

    if (managedTeam) {
      throw new Error(
        'Cannot deactivate user while assigned as manager of an active team',
      );
    }
  }

  /**
   * Do not deactivate a coordinator
   * while they are still assigned to
   * an active team.
   */
  if (
    user.role ===
    'COORDINATOR'
  ) {
    const coordinatedTeam =
      await database('teams')
        .where(
          'coordinator_id',
          userId,
        )
        .where(
          'is_active',
          true,
        )
        .first('id');

    if (coordinatedTeam) {
      throw new Error(
        'Cannot deactivate user while assigned as coordinator of an active team',
      );
    }
  }

  const [updatedUser] =
    await database('users')
      .where('id', userId)
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
        'email',
        'role',
        'team_id',
        'is_active',
        'deactivated_at',
        'deactivated_by',
      ]);

  return {
    user: updatedUser,
    reason,
  };
}

async listForSelect(
  filters: ListUsersQuery,
): Promise<UserOptionDTO[]> {
  const query = database('users')
    .select('id', 'name', 'email', 'role', 'team_id', 'is_active')
    .orderBy('name', 'asc');

  if (filters.role) {
    query.where('role', filters.role);
  }

  if (filters.teamId) {
    query.where('team_id', filters.teamId);
  }

  if (filters.isActive) {
    query.where('is_active', filters.isActive === 'true');
  }

  const users = await query;

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    teamId: user.team_id,
    isActive: user.is_active,
  }));
}
}

export default new UserService();


