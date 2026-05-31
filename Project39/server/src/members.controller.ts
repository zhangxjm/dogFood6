import { Controller, Get, Param } from '@nestjs/common';
import { queryAll, queryOne } from './database';

@Controller('members')
export class MembersController {
  @Get()
  findAll() {
    return queryAll('SELECT * FROM members');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return queryOne('SELECT * FROM members WHERE id = ?', [Number(id)]);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    const numId = Number(id);
    const member = queryOne('SELECT * FROM members WHERE id = ?', [numId]);
    if (!member) {
      return { error: 'Member not found' };
    }

    const totalAppointments = (queryAll('SELECT COUNT(*) as count FROM appointments WHERE member_id = ?', [numId])[0] as any).count;
    const completedAppointments = (queryAll('SELECT COUNT(*) as count FROM appointments WHERE member_id = ? AND status = ?', [numId, 'completed'])[0] as any).count;
    const pendingAppointments = (queryAll('SELECT COUNT(*) as count FROM appointments WHERE member_id = ? AND status = ?', [numId, 'pending'])[0] as any).count;

    return {
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      totalSpent: (member as any).total_spent,
      balance: (member as any).balance,
      visitCount: (member as any).visit_count,
      level: (member as any).level,
    };
  }
}
