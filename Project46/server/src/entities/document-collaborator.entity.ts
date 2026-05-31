import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Document } from './document.entity';

@Entity('document_collaborators')
export class DocumentCollaborator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  documentId: string;

  @Column()
  userId: string;

  @Column({ default: 'editor' })
  role: 'owner' | 'editor' | 'viewer';

  @Column({ nullable: true })
  cursorPosition: string;

  @Column({ nullable: true })
  selection: string;

  @Column({ default: false })
  isActive: boolean;

  @ManyToOne(() => Document, document => document.collaborators)
  @JoinColumn({ name: 'documentId' })
  document: Document;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  joinedAt: Date;
}
