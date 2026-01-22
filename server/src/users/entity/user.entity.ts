import {
  Column,
  CreateDateColumn,
  Generated,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface UserMeta {
  version: number;
  description?: string;
}

export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ name: 'external_id', type: 'uuid', unique: true })
  @Generated('uuid')
  externalId: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ type: 'jsonb' })
  meta: UserMeta | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
