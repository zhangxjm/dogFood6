import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { AppointmentsController } from './appointments.controller';
import { MembersController } from './members.controller';
import { StatisticsController } from './statistics.controller';

@Module({
  controllers: [
    ServicesController,
    AppointmentsController,
    MembersController,
    StatisticsController,
  ],
})
export class AppModule {}
