import { Module } from '@nestjs/common';
import { ExhibitionController } from './exhibition.controller';
import { ExhibitionService } from './exhibition.service';
import { ExhibitionGateway } from './exhibition.gateway';

@Module({
  controllers: [ExhibitionController],
  providers: [ExhibitionService, ExhibitionGateway],
  exports: [ExhibitionService],
})
export class ExhibitionModule {}
