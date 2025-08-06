import { GenericContainer, StartedTestContainer } from 'testcontainers';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { Url } from '../src/url/entities/url.entity';
import { ClickLogs } from '../src/analytics/entities/click_logs.entity';
import { UrlMetricsDaily } from '../src/analytics/entities/url_metrics_daily.entity';

let redisContainer: StartedTestContainer;
let postgresContainer: StartedPostgreSqlContainer;

async function setup(): Promise<void> {
  // Start Redis container for testing
  const redis = await new GenericContainer('redis:latest')
    .withExposedPorts(6379)
    .start();

  // Start Postgres container for testing
  const postgres = await new PostgreSqlContainer('postgres:latest')
    .withDatabase('test_db')
    .withUsername('postgres')
    .withPassword('postgres')
    .start();

  redisContainer = redis;
  postgresContainer = postgres;

  // Set environment variables for testing
  process.env.NODE_ENV = 'development';
  process.env.REDIS_HOST = redis.getHost();
  process.env.REDIS_PORT = redis.getMappedPort(6379).toString();
  process.env.REDIS_URL = `redis://${redis.getHost()}:${redis.getMappedPort(6379)}`;

  process.env.POSTGRES_HOST = postgres.getHost();
  process.env.POSTGRES_USER = postgres.getUsername();
  process.env.POSTGRES_PASSWORD = postgres.getPassword();
  process.env.POSTGRES_DB = postgres.getDatabase();
  process.env.POSTGRES_INTERNAL_PORT = '5432';
  process.env.POSTGRES_EXTERNAL_PORT = postgres.getMappedPort(5432).toString();
  process.env.DATABASE_URL = postgres.getConnectionUri();

  // Initialize database with migrations
  const dataSource = new DataSource({
    type: 'postgres',
    host: postgres.getHost(),
    port: postgres.getMappedPort(5432),
    username: postgres.getUsername(),
    password: postgres.getPassword(),
    database: postgres.getDatabase(),
    entities: [Url, ClickLogs, UrlMetricsDaily],
    migrations: [join(__dirname, '../src/migrations/*.ts')],
    synchronize: true,
  });

  await dataSource.initialize();
  await dataSource.synchronize(true);
  await dataSource.destroy();

  process.env.THROTTLE_TTL = '1000'; // 1 second for faster testing
  process.env.THROTTLE_LIMIT = '3'; // Lower limit for easier testing
  process.env.THROTTLE_BLOCK_DURATION = '2000'; // 2 seconds for faster testing

  // Wait for containers to be ready
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

async function teardown(): Promise<void> {
  // Stop containers
  if (redisContainer) {
    await redisContainer.stop();
  }
  if (postgresContainer) {
    await postgresContainer.stop();
  }
}

export { setup as default, teardown };
