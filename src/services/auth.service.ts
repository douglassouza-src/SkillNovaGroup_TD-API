import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import database from '../database/knex.js';
import type { LoginDTO } from '../dto/auth.dto.js';

class AuthService {
  async login({ email, password }: LoginDTO) {
    const user = await database('users')
      .select(
        'id',
        'name',
        'email',
        'password_hash',
        'role',
        'team_id',
        'is_active',
      )
      .where({
        email,
      })
      .first();

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.is_active) {
      throw new Error('User is inactive');
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!passwordMatches) {
      throw new Error('Invalid credentials');
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      {
        sub: user.id,
        role: user.role,
        teamId: user.team_id,
      },
      secret,
      {
        expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any,
      },
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.team_id,
      },
      token,
    };
  }
}

export default new AuthService();