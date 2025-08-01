# Setting up Database Migrations in NestJS

This guide explains how to set up and manage database migrations in our NestJS application using TypeORM.

## Initial Setup

1. Install TypeORM CLI:

```bash
npm install --save-dev typeorm
```

2. Create a TypeORM configuration file at `src/config/typeorm.config.ts`:

```typescript
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { ClickLogs } from '../analytics/entities/click_logs.entity';
import { UrlMetricsDaily } from '../analytics/entities/url_metrics_daily.entity';
import { Url } from '../url/entities/url.entity';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('POSTGRES_HOST'),
  port: configService.get('POSTGRES_INTERNAL_PORT'),
  username: configService.get('POSTGRES_USER'),
  password: configService.get('POSTGRES_PASSWORD'),
  database: configService.get('POSTGRES_DB'),
  entities: [ClickLogs, UrlMetricsDaily, Url],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // Always false for production
});
```

3. Add migration scripts to `package.json`:

```json
{
  "scripts": {
    "typeorm": "ts-node ./node_modules/typeorm/cli",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:generate": "npm run typeorm -- -d src/config/typeorm.config.ts migration:generate",
    "migration:run": "npm run typeorm -- -d src/config/typeorm.config.ts migration:run",
    "migration:revert": "npm run typeorm -- -d src/config/typeorm.config.ts migration:revert"
  }
}
```

4. Create migrations directory:

```bash
mkdir -p src/migrations
```

5. Disable synchronize in TypeORM configuration (`app.module.ts`):

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    // ... other config
    synchronize: false, // Disable auto-synchronization
    // ... rest of config
  }),
  inject: [ConfigService],
}),
```

## Working with Migrations

### Development Workflow

1. **Generate a Migration**
   - After making changes to your entities, generate a migration:

   ```bash
   npm run migration:generate -- src/migrations/YourMigrationName
   ```

   - This will create a new file in `src/migrations` with the changes needed

2. **Run Migrations**

   ```bash
   npm run migration:run
   ```

3. **Revert Last Migration** (if needed)

   ```bash
   npm run migration:revert
   ```

4. **Create Empty Migration** (for custom SQL)

   ```bash
   npm run migration:create -- src/migrations/CustomMigration
   ```

### Production Workflow

1. **Before Deployment**
   - Test migrations in a staging environment
   - Back up the production database
   - Include migration scripts in your deployment package

2. **During Deployment**

   ```bash
   # Run migrations before starting the application
   NODE_ENV=production npm run migration:run
   
   # Start the application
   npm run start:prod
   ```

## Best Practices

1. **Never use `synchronize: true` in production**
   - This can lead to data loss
   - Always use migrations for schema changes

2. **Version Control**
   - Always commit migration files to version control
   - Keep migrations in chronological order
   - Don't modify existing migrations that have been run in any environment

3. **Testing**
   - Test migrations in development first
   - Then test in staging environment
   - Have a rollback plan for each migration

4. **Backup**
   - Always backup database before running migrations in production
   - Keep backup until you're sure the migration was successful

5. **Monitoring**
   - Add logging to track migration execution
   - Consider adding a health check endpoint that verifies database connectivity

## Troubleshooting

1. **Migration Failed**
   - Check the error message in the logs
   - Use `migration:revert` to rollback if needed
   - Fix the issue and regenerate the migration

2. **Inconsistent Schema**
   - If schema gets out of sync, you can:
     - Drop the database and rerun all migrations (development only)
     - Compare schema with migration history
     - Generate a new migration to fix inconsistencies

## Commands Reference

```bash
# Generate a migration
npm run migration:generate -- src/migrations/MigrationName

# Create empty migration
npm run migration:create -- src/migrations/CustomMigration

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```
