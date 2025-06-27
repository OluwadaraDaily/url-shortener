# Setting up a service

1. Command to create a new service

   This should be inside the services folder

   ```bash
   nest new <service-name>
   ```

2. Create a repository online (Github)
   Then, push initial commit.

3. Setup Dockerfile and .dockerignore
   Copy from other services

4. Update docker compose file in infra/docker/docker-compose.dev.yaml
   Update it with the details of the new service added

5. Setup ConfigModule in the root app module to have access to env variables throughout the service

6. Update ESLint config according to `analytics-service`
