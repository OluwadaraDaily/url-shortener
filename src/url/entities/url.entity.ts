import { ClickLogs } from 'src/analytics/entities/click_logs.entity';
import { UrlMetricsDaily } from 'src/analytics/entities/url_metrics_daily.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Url {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 2048, nullable: false })
  original_url: string;

  @Column({ type: 'varchar', length: 2048, nullable: false })
  short_code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tag: string;

  @Column({ type: 'boolean', default: true, nullable: false })
  is_active: boolean;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  created_at: Date;

  @OneToMany(() => ClickLogs, (clickLog) => clickLog.url)
  clickLogs: ClickLogs[];

  @OneToMany(() => UrlMetricsDaily, (metrics) => metrics.url)
  dailyMetrics: UrlMetricsDaily[];
}
