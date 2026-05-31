import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../entities/document.entity';
import { DocumentCollaborator } from '../../entities/document-collaborator.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(DocumentCollaborator)
    private collaboratorRepository: Repository<DocumentCollaborator>,
  ) {}

  async findAll(userId: string) {
    return this.documentRepository
      .createQueryBuilder('doc')
      .leftJoin('doc.collaborators', 'collab')
      .where('doc.creatorId = :userId OR collab.userId = :userId', { userId })
      .leftJoinAndSelect('doc.creator', 'creator')
      .leftJoinAndSelect('doc.collaborators', 'collaborators')
      .leftJoinAndSelect('collaborators.user', 'user')
      .select([
        'doc.id',
        'doc.title',
        'doc.type',
        'doc.createdAt',
        'doc.updatedAt',
        'doc.roomId',
        'creator.id',
        'creator.nickname',
        'creator.avatar',
        'collaborators.id',
        'collaborators.role',
        'collaborators.isActive',
        'collaborators.cursorPosition',
        'user.id',
        'user.nickname',
        'user.avatar',
      ])
      .getMany();
  }

  async findOne(id: string, userId: string) {
    const doc = await this.documentRepository.findOne({
      where: { id },
      relations: ['creator', 'collaborators', 'collaborators.user'],
    });
    if (!doc) {
      throw new NotFoundException('文档不存在');
    }

    const hasAccess =
      doc.creatorId === userId ||
      doc.collaborators.some((c) => c.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('无权访问此文档');
    }

    return doc;
  }

  async create(userId: string, data: Partial<Document>) {
    const doc = this.documentRepository.create({
      ...data,
      creatorId: userId,
      content: data.content || '',
    });
    const saved = await this.documentRepository.save(doc);

    await this.collaboratorRepository.save(
      this.collaboratorRepository.create({
        documentId: saved.id,
        userId,
        role: 'owner',
        isActive: true,
      }),
    );

    return this.findOne(saved.id, userId);
  }

  async update(id: string, userId: string, data: Partial<Document>) {
    const doc = await this.findOne(id, userId);
    const collaborator = doc.collaborators.find((c) => c.userId === userId);
    
    if (!collaborator || (collaborator.role !== 'owner' && collaborator.role !== 'editor')) {
      throw new ForbiddenException('无权编辑此文档');
    }

    await this.documentRepository.update(id, {
      title: data.title,
      content: data.content,
      delta: data.delta,
    });

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string) {
    const doc = await this.findOne(id, userId);
    const collaborator = doc.collaborators.find((c) => c.userId === userId);
    
    if (!collaborator || collaborator.role !== 'owner') {
      throw new ForbiddenException('无权删除此文档');
    }

    await this.collaboratorRepository.delete({ documentId: id });
    await this.documentRepository.delete(id);
    return { success: true };
  }

  async addCollaborator(documentId: string, userId: string, targetUserId: string, role: DocumentCollaborator['role']) {
    const doc = await this.findOne(documentId, userId);
    const collaborator = doc.collaborators.find((c) => c.userId === userId);
    
    if (!collaborator || collaborator.role !== 'owner') {
      throw new ForbiddenException('无权添加协作者');
    }

    const existing = await this.collaboratorRepository.findOne({
      where: { documentId, userId: targetUserId },
    });
    
    if (existing) {
      return existing;
    }

    return this.collaboratorRepository.save(
      this.collaboratorRepository.create({
        documentId,
        userId: targetUserId,
        role,
        isActive: false,
      }),
    );
  }

  async removeCollaborator(documentId: string, userId: string, targetUserId: string) {
    const doc = await this.findOne(documentId, userId);
    const collaborator = doc.collaborators.find((c) => c.userId === userId);
    
    if (!collaborator || collaborator.role !== 'owner') {
      throw new ForbiddenException('无权移除协作者');
    }

    await this.collaboratorRepository.delete({ documentId, userId: targetUserId });
    return { success: true };
  }

  async updateCursor(documentId: string, userId: string, position: any, selection?: string) {
    await this.collaboratorRepository.update(
      { documentId, userId },
      {
        cursorPosition: JSON.stringify(position),
        selection: selection ? JSON.stringify(selection) : null,
      },
    );
    return { success: true };
  }

  async setActive(documentId: string, userId: string, isActive: boolean) {
    await this.collaboratorRepository.update(
      { documentId, userId },
      { isActive },
    );
    return { success: true };
  }

  async getActiveCollaborators(documentId: string) {
    return this.collaboratorRepository.find({
      where: { documentId, isActive: true },
      relations: ['user'],
    });
  }
}
