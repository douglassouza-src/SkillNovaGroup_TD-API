import bcrypt from 'bcrypt';

import database from './knex.js';

const DEFAULT_PASSWORD = 'SkillNova@123';

async function seed(): Promise<void> {
  console.log('Starting development seed...');

  await database.transaction(async (trx) => {
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    /**
     * ============================================================
     * MASTER
     * ============================================================
     */

    let master = await trx('users')
      .where({
        email: 'master@skillnova.dev',
      })
      .first();

    if (!master) {
      [master] = await trx('users')
        .insert({
          name: 'Administrador Master',
          email: 'master@skillnova.dev',
          password_hash: passwordHash,
          role: 'MASTER',
          team_id: null,
          is_active: true,
        })
        .returning('*');
    }

    /**
     * ============================================================
     * MANAGER
     * ============================================================
     */

    let manager = await trx('users')
      .where({
        email: 'manager@skillnova.dev',
      })
      .first();

    if (!manager) {
      [manager] = await trx('users')
        .insert({
          name: 'Gerente Demo',
          email: 'manager@skillnova.dev',
          password_hash: passwordHash,
          role: 'MANAGER',
          team_id: null,
          is_active: true,
          created_by: master.id,
          updated_by: master.id,
        })
        .returning('*');
    }

    /**
     * ============================================================
     * TEAM
     * ============================================================
     */

    let team = await trx('teams')
      .where({
        name: 'Equipe Técnica Demo',
      })
      .first();

    if (!team) {
      [team] = await trx('teams')
        .insert({
          name: 'Equipe Técnica Demo',
          description: 'Equipe utilizada para demonstração da aplicação.',
          manager_id: manager.id,
          coordinator_id: null,
          is_active: true,
          created_by: master.id,
          updated_by: master.id,
        })
        .returning('*');
    }

    /**
     * ============================================================
     * COORDINATOR
     * ============================================================
     */

    let coordinator = await trx('users')
      .where({
        email: 'coordinator@skillnova.dev',
      })
      .first();

    if (!coordinator) {
      [coordinator] = await trx('users')
        .insert({
          name: 'Coordenador Demo',
          email: 'coordinator@skillnova.dev',
          password_hash: passwordHash,
          role: 'COORDINATOR',
          team_id: team.id,
          is_active: true,
          created_by: master.id,
          updated_by: master.id,
        })
        .returning('*');
    }

    /**
     * ============================================================
     * UPDATE TEAM COORDINATOR
     * ============================================================
     */

    await trx('teams')
      .where({
        id: team.id,
      })
      .update({
        coordinator_id: coordinator.id,
        updated_by: master.id,
        updated_at: trx.fn.now(),
      });

    /**
     * ============================================================
     * TECHNICIANS
     * ============================================================
     */

    const technicians = [
      {
        name: 'Técnico Demo 1',
        email: 'technician1@skillnova.dev',
      },
      {
        name: 'Técnico Demo 2',
        email: 'technician2@skillnova.dev',
      },
      {
        name: 'Técnico Demo 3',
        email: 'technician3@skillnova.dev',
      },
    ];

    for (const technician of technicians) {
      const existingTechnician = await trx('users')
        .where({
          email: technician.email,
        })
        .first();

      if (!existingTechnician) {
        await trx('users').insert({
          name: technician.name,
          email: technician.email,
          password_hash: passwordHash,
          role: 'TECHNICIAN',
          team_id: team.id,
          is_active: true,
          created_by: coordinator.id,
          updated_by: coordinator.id,
        });
      }
    }
  });

  console.log('Development seed completed.');
}

seed()
  .catch((error) => {
    console.error('Development seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.destroy();
  });