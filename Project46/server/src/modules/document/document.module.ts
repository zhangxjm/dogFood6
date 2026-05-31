import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { Document } from '../../entities/document.entity';
import { DocumentCollaborator } from '../../entities/document-collaborator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, DocumentCollaborator])],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
