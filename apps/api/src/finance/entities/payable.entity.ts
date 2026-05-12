import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

export type PayableDocumentType = 'BOLETO' | 'INVOICE';
export type PayableStatus = 'PENDING' | 'PAID' | 'CANCELLED';

@Entity('payables')
export class Payable {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  organizationId!: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization;

  /** Boleto / NF-e style identifier for reconciliation */
  @Column({ type: 'varchar', length: 64, default: 'BOLETO' })
  documentType!: PayableDocumentType;

  @Column({ type: 'varchar', length: 32, default: 'PENDING' })
  status!: PayableStatus;

  @Column({ type: 'int' })
  amountCents!: number;

  @Column({ type: 'date' })
  dueDate!: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  externalReference!: string | null;
}
