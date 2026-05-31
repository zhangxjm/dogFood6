import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { queryAll, queryOne, runSql } from './database';

@Controller('appointments')
export class AppointmentsController {
  @Get()
  findAll(@Query('status') status?: string) {
    if (status) {
      return queryAll('SELECT * FROM appointments WHERE status = ? ORDER BY appointment_time DESC', [status]);
    }
    return queryAll('SELECT * FROM appointments ORDER BY appointment_time DESC');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return queryOne('SELECT * FROM appointments WHERE id = ?', [Number(id)]);
  }

  @Post()
  create(@Body() body: any) {
    const { memberId, memberName, serviceId, serviceName, servicePrice, appointmentTime, note, amount } = body;
    runSql(
      'INSERT INTO appointments (member_id, member_name, service_id, service_name, service_price, appointment_time, status, duration, amount, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [memberId || 1, memberName || '', serviceId, serviceName, servicePrice, appointmentTime, 'pending', 0, amount || servicePrice, note || '']
    );
    const result = queryOne('SELECT last_insert_rowid() as id FROM appointments');
    return { id: (result as any)?.id, message: 'Appointment created successfully' };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const numId = Number(id);
    const appointment = queryOne('SELECT * FROM appointments WHERE id = ?', [numId]);
    if (!appointment) {
      return { error: 'Appointment not found' };
    }

    if (body.status) {
      runSql('UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [body.status, numId]);

      if (body.status === 'completed' && (appointment as any).member_id) {
        runSql('UPDATE members SET total_spent = total_spent + ?, visit_count = visit_count + 1 WHERE id = ?', [(appointment as any).amount, (appointment as any).member_id]);
        runSql('INSERT INTO consumption_records (member_id, appointment_id, amount, payment_method) VALUES (?, ?, ?, ?)', [(appointment as any).member_id, numId, (appointment as any).amount, 'balance']);
      }
    }

    if (body.duration !== undefined) {
      runSql('UPDATE appointments SET duration = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [body.duration, numId]);
    }

    return { message: 'Appointment updated successfully' };
  }
}
