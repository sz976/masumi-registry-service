# Docker Quick Start Guide for Masumi Registry Service

This guide will help you quickly deploy Masumi Registry Service using Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on your machine
- [Blockfrost.io](https://blockfrost.io) account for Cardano blockchain API access
- Basic understanding of command line operations

## Quick Start

1. **Configure Environment Variables**

   Copy the `.env.example` file to `.env` and update the required values:

   ```
   # At minimum, update these values
   POSTGRES_PASSWORD=your_secure_postgres_password
   ENCRYPTION_KEY=your_secure_32_character_encryption_key (must be at least 32 chars)
   ADMIN_KEY=your_secure_admin_key
   BLOCKFROST_API_KEY_PREPROD=your_blockfrost_preprod_api_key
   ```

2. **Generate SSL Certificates**

   For local development, you can generate self-signed certificates:

   ```bash
   chmod +x generate-certificates.sh
   ./generate-certificates.sh
   ```

3. **Start the Services**

   Run the following command in the same directory as your `docker-compose.yml`:

   ```bash
   docker-compose up -d
   ```

4. **Access the Service**

   Once running, access:
   - API Documentation: https://localhost/api/docs

## Data Persistence

The Docker setup includes persistent volumes:

- `postgres_data`: Stores PostgreSQL database files
- `masumi_registry_logs`: Stores application logs
- `nginx_logs`: Stores nginx logs

These volumes ensure your data persists across container restarts.

## Common Operations

- **Viewing logs**:
  ```bash
  docker-compose logs -f registry-service
  ```

- **Restart services**:
  ```bash
  docker-compose restart
  ```

- **Stop services**:
  ```bash
  docker-compose down
  ```

- **Complete teardown** (including volumes):
  ```bash
  docker-compose down -v
  ```
  Warning: This will delete all data, including database records.

## Troubleshooting

1. **Database connection issues**:
   - Check `POSTGRES_PASSWORD` in `.env` file matches what's in the Docker configuration
   - Ensure PostgreSQL container is running: `docker ps | grep postgres`

2. **API Errors**:
   - Verify your Blockfrost API key is valid for the selected network
   - Check logs for specific error messages: `docker-compose logs registry-service`

## Next Steps

For more detailed instructions, refer to the [official Masumi documentation](https://docs.masumi.network/).
