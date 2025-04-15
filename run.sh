#!/bin/bash
set -e

# Terminal colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default values
BLOCKFROST_API_KEY_PREPROD="preprodtestkey_youmustchangethis"
BLOCKFROST_API_KEY_MAINNET=""
SSL_CERT_PATH=""
SSL_KEY_PATH=""

# Parse command line arguments
usage() {
    echo -e "Usage: $0 [OPTIONS]"
    echo -e "Options:"
    echo -e "  -p, --preprod-key KEY     Blockfrost API key for Preprod environment"
    echo -e "  -m, --mainnet-key KEY     Blockfrost API key for Mainnet environment"
    echo -e "  --ssl-cert PATH           Path to SSL certificate (optional)"
    echo -e "  --ssl-key PATH            Path to SSL private key (optional)"
    echo -e "  -h, --help                Display this help message"
    exit 1
}

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--preprod-key)
            BLOCKFROST_API_KEY_PREPROD="$2"
            shift 2
            ;;
        -m|--mainnet-key)
            BLOCKFROST_API_KEY_MAINNET="$2"
            shift 2
            ;;
        --ssl-cert)
            SSL_CERT_PATH="$2"
            shift 2
            ;;
        --ssl-key)
            SSL_KEY_PATH="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            ;;
    esac
done

echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}   Masumi Registry Service - Docker Deployment Setup     ${NC}"
echo -e "${BLUE}=========================================================${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker and Docker Compose first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Function to generate a secure random string - using openssl to avoid locale issues
generate_secure_string() {
    local length=$1
    openssl rand -base64 $((length*2)) | tr -dc 'a-zA-Z0-9!@#$%^&*()-_=+' | head -c "$length"
}

# Step 1: Create .env file
echo -e "\n${YELLOW}Step 1: Creating .env file with secure random values${NC}"

# Generate secure random values
POSTGRES_PASSWORD=$(generate_secure_string 32)
ENCRYPTION_KEY=$(generate_secure_string 48)
ADMIN_KEY=$(generate_secure_string 32)

# Create .env file
cat > .env << EOL
# Database settings
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DATABASE_URL=postgresql://masumi:${POSTGRES_PASSWORD}@postgres:5432/masumi_registry?schema=public

# Security keys
ENCRYPTION_KEY=${ENCRYPTION_KEY}
Admin_KEY=${ADMIN_KEY}

# Blockfrost API keys
Blockfrost_API_KEY_Preprod=${BLOCKFROST_API_KEY_PREPROD}
Blockfrost_API_KEY_Mainnet=${BLOCKFROST_API_KEY_MAINNET}

# Environment settings
NODE_ENV=production
PORT=3000

# Registry update intervals
UPDATE_CARDANO_REGISTRY_INTERVAL=120
UPDATE_CARDANO_DEREGISTER_INTERVAL=150
EOL

echo -e "${GREEN}Created .env file with secure random values.${NC}"

# Step 2: Handle SSL certificates
echo -e "\n${YELLOW}Step 2: Setting up SSL certificates for NGINX${NC}"

# Create certs directory
mkdir -p nginx/certs

if [ -n "$SSL_CERT_PATH" ] && [ -n "$SSL_KEY_PATH" ]; then
    if [ -f "$SSL_CERT_PATH" ] && [ -f "$SSL_KEY_PATH" ]; then
        echo -e "${GREEN}Using provided SSL certificate and key${NC}"
        cp "$SSL_CERT_PATH" nginx/certs/server.crt
        cp "$SSL_KEY_PATH" nginx/certs/server.key
        chmod 644 nginx/certs/server.crt
        chmod 600 nginx/certs/server.key
    else
        echo -e "${RED}Error: Provided SSL certificate or key file not found.${NC}"
        echo -e "${YELLOW}Falling back to generating self-signed certificate.${NC}"
        chmod +x generate-certificates.sh
        ./generate-certificates.sh
    fi
else
    echo -e "${YELLOW}No SSL certificate provided. Generating self-signed certificate.${NC}"
    echo -e "${YELLOW}Note: Self-signed certificates will trigger browser security warnings.${NC}"
    echo -e "${YELLOW}For production use, provide valid SSL certificates using --ssl-cert and --ssl-key options.${NC}"
    
    chmod +x generate-certificates.sh
    ./generate-certificates.sh
fi

# Step 3: Create necessary directories
echo -e "\n${YELLOW}Step 3: Creating necessary directories${NC}"
mkdir -p logs

# Step 4: Check that Docker can access the current directory
echo -e "\n${YELLOW}Step 4: Verifying Docker access permissions${NC}"
if [ ! -w "$(pwd)" ]; then
    echo -e "${RED}Warning: The current directory may not be writable by Docker.${NC}"
    echo -e "${RED}You might encounter permission issues when running containers.${NC}"
else
    echo -e "${GREEN}Directory permissions look good.${NC}"
fi

# SSL Certificate information
echo -e "\n${BLUE}SSL Certificate Status:${NC}"
if [ -n "$SSL_CERT_PATH" ] && [ -n "$SSL_KEY_PATH" ] && [ -f "nginx/certs/server.crt" ] && [ -f "nginx/certs/server.key" ]; then
    echo -e "  ${GREEN}• Using provided SSL certificates${NC}"
else
    echo -e "  ${YELLOW}• Using self-signed SSL certificates${NC}"
    echo -e "    Browser security warnings will appear when accessing the service."
    echo -e "    For production use, replace with valid certificates from a trusted CA."
fi

# Final step: Print summary and next steps
echo -e "\n${GREEN}=========================================================${NC}"
echo -e "${GREEN} Setup Complete!${NC}"
echo -e "${GREEN}=========================================================${NC}"
echo -e "${BLUE}The following files have been created/updated:${NC}"
echo -e "  - .env (with secure random credentials)"
echo -e "  - nginx/certs/server.key (SSL private key)"
echo -e "  - nginx/certs/server.crt (SSL certificate)"
echo -e "\n${BLUE}Next Steps:${NC}"
echo -e "1. Run the following command to start the services:"
echo -e "   ${GREEN}docker compose up -d --build${NC}"
echo -e "2. Access the Registry Service at:"
echo -e "   ${GREEN}https://localhost/api/docs${NC}"

echo -e "\n${GREEN}Ready for deployment!${NC}"
