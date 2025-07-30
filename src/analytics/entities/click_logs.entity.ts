import { Url } from 'src/url/entities/url.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'click_logs' })
export class ClickLogs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  url_id: string;

  @ManyToOne(() => Url, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'url_id' })
  url: Url;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referer: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ip_address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  user_agent: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  country: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
