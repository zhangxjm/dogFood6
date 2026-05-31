import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { DocumentService } from './document.service';
import { AuthGuard } from '../../guards/auth.guard';
import { Document } from '../../entities/document.entity';

@Controller('api/documents')
@UseGuards(AuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  findAll(@Req() req: Request) {
    return this.documentService.findAll((req as any).user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.documentService.findOne(id, (req as any).user.id);
  }

  @Post()
  create(@Req() req: Request, @Body() data: Partial<Document>) {
    return this.documentService.create((req as any).user.id, data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() data: Partial<Document>,
  ) {
    return this.documentService.update(id, (req as any).user.id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.documentService.remove(id, (req as any).user.id);
  }

  @Post(':id/collaborators')
  addCollaborator(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() body: { userId: string; role: string },
  ) {
    return this.documentService.addCollaborator(
      id,
      (req as any).user.id,
      body.userId,
      body.role as any,
    );
  }

  @Delete(':id/collaborators/:userId')
  removeCollaborator(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Req() req: Request,
  ) {
    return this.documentService.removeCollaborator(
      id,
      (req as any).user.id,
      targetUserId,
    );
  }

  @Get(':id/collaborators/active')
  getActiveCollaborators(@Param('id') id: string) {
    return this.documentService.getActiveCollaborators(id);
  }

  @Put(':id/cursor')
  updateCursor(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() body: { position: any; selection?: any },
  ) {
    return this.documentService.updateCursor(
      id,
      (req as any).user.id,
      body.position,
      body.selection,
    );
  }

  @Put(':id/active')
  setActive(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() body: { isActive: boolean },
  ) {
    return this.documentService.setActive(
      id,
      (req as any).user.id,
      body.isActive,
    );
  }
}
