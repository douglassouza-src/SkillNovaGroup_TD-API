import type { Request, Response } from 'express';

import authService from '../services/auth.service.js';
import { loginSchema } from '../zod/auth.zod.js';

class AuthController {
  async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body);

    const result = await authService.login(data);

    return res.status(200).json(result);
  }

  async me(req: Request, res: Response) {
    return res.status(200).json({
      user: req.user,
    });
  }
}

export default new AuthController();