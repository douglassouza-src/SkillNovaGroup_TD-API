import type {
  Request,
  Response,
} from 'express';

import dashboardService from '../services/dashboard.service.js';

class DashboardController {
  async manager(
    req: Request,
    res: Response,
  ) {
    const dashboard =
      await dashboardService.getManagerDashboard();

    return res.status(200).json({
      dashboard,
    });
  }
}

export default new DashboardController();