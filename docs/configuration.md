# Configuration

Configure the environment variables by copying the `.env.example` file to `.env`or `.env.local` and setup the
variables

- **DATABASE_URL**: The endpoint for a PostgreSQL database to be used
- **PORT**: The port to run the server on (default is 3001)

If you're setting up the database for the first time (or want to provide some initial data) you also need the
following variables before seeding:

- **BLOCKFROST_API_KEY**: An API Key from [https://blockfrost.io/](https://blockfrost.io/) for the correct blockchain network, you can create this for free
- **REGISTRY_SOURCE_NETWORK**: PREPROD, PREVIEW or MAINNET
- **ADMIN_KEY**: The key of the admin user, this key will have all permissions and can create new api_keys
