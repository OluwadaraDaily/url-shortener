import { Url } from 'src/url/entities/url.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'url_metrics_daily' })
@Unique(['url_id', 'date'])
export class UrlMetricsDaily {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  url_id: string;

  @ManyToOne(() => Url, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'url_id' })
  url: Url;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'integer', default: 0 })
  total_clicks: number;

  @Column({ type: 'integer', default: 0 })
  unique_visitors: number;

  @Column({ type: 'integer', nullable: true })
  peak_hour: number;

  @Column({ type: 'jsonb', nullable: true })
  browser_distribution: Record<string, number>;

  @Column({ type: 'jsonb', nullable: true })
  country_distribution: Record<string, number>;

  @Column({ type: 'jsonb', nullable: true })
  referrer_distribution: Record<string, number>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
