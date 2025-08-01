import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1754052563000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // URL table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "url" (
                "id" SERIAL PRIMARY KEY,
                "original_url" VARCHAR NOT NULL,
                "short_url" VARCHAR NOT NULL UNIQUE,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    // Click logs table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "click_logs" (
                "id" SERIAL PRIMARY KEY,
                "url_id" INTEGER NOT NULL,
                "ip_address" VARCHAR,
                "user_agent" VARCHAR,
                "referrer" VARCHAR,
                "country_code" VARCHAR(2),
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "fk_url_click_logs" FOREIGN KEY ("url_id") REFERENCES "url"("id") ON DELETE CASCADE
            )
        `);

    // URL metrics daily table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "url_metrics_daily" (
                "id" SERIAL PRIMARY KEY,
                "url_id" INTEGER NOT NULL,
                "date" DATE NOT NULL,
                "clicks" INTEGER DEFAULT 0,
                "unique_visitors" INTEGER DEFAULT 0,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "fk_url_metrics" FOREIGN KEY ("url_id") REFERENCES "url"("id") ON DELETE CASCADE,
                CONSTRAINT "unique_url_date" UNIQUE ("url_id", "date")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "url_metrics_daily"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "click_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "url"`);
  }
}
