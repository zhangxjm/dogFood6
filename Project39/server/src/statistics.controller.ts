import { Controller, Get } from '@nestjs/common';
import { queryAll } from './database';

@Controller('statistics')
export class StatisticsController {
  @Get('overview')
  getOverview() {
    const totalServices = (queryAll('SELECT COUNT(*) as count FROM services WHERE status = ?', ['active'])[0] as any).count;
    const totalMembers = (queryAll('SELECT COUNT(*) as count FROM members')[0] as any).count;
    const totalAppointments = (queryAll('SELECT COUNT(*) as count FROM appointments')[0] as any).count;
    const completedAppointments = (queryAll('SELECT COUNT(*) as count FROM appointments WHERE status = ?', ['completed'])[0] as any).count;
    const totalRevenue = (queryAll('SELECT COALESCE(SUM(amount), 0) as total FROM appointments WHERE status = ?', ['completed'])[0] as any).total;

    return {
      totalServices,
      totalMembers,
      totalAppointments,
      completedAppointments,
      totalRevenue,
    };
  }

  @Get('monthly')
  getMonthly() {
    return queryAll('SELECT * FROM monthly_stats ORDER BY month ASC');
  }
}
