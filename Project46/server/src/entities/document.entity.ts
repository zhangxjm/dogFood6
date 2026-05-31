import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { DocumentCollaborator } from './document-collaborator.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'text', nullable: true })
  delta: string;

  @Column({ default: 'document' })
  type: 'document' | 'spreadsheet' | 'presentation' | 'whiteboard';

  @Column()
  creatorId: string;

  @Column({ nullable: true })
  roomId: string;

  @ManyToOne(() => User, user => user.documents)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @OneToMany(() => DocumentCollaborator, collaborator => collaborator.document)
  collaborators: DocumentCollaborator[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
