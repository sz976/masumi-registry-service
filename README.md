# Masumi Registry Service

This repository contains the backend service for the Masumi Registry Service.

## Goals

The goal of the Masumi Registry Service is to provide an easy to use and still performant service that can query the Cardano blockchain for registered agents and nodes.
It currently supports a REST full API that provides filtering options for the registry and capabilities.

Furthermore it supports a API key system with different permissions and a crediting system to access the registry (enables registry as a service) and multiple blockchain networks and sources.

Registry entries (and de-registrations) are cached in a database and periodically updated in the background to increase performance and redundant queries.

## Related Repositories

[Masumi Payment Service](https://github.com/nftmakerio/masumi-payment-service). Used to register and deregister agents and handle payments.

## Project Architecture and Technology Stack

This section provides an overview of the key architectural patterns and technologies employed in this service:

- [Express-Zod-Api](https://www.npmjs.com/package/express-zod-api): Utilized as the framework for implementing our RESTful API with Swagger UI. The library uses:
  - [Express](http://expressjs.com/) as the framework for implementing our RESTful API
  - [Zod](https://www.npmjs.com/package/zod) for request validation
- [Prisma](https://www.prisma.io/): Implemented as the ORM to interact with our PostgreSQL database
- [DOTENV](https://www.npmjs.com/package/dotenv): Incorporated to securely load environment variables from `.env` files
- [Zod-to-OpenAPI](https://www.npmjs.com/package/@asteasolutions/zod-to-openapi): Used to generate the OpenAPI schema from the Zod schemas
- [Blockfrost](https://www.npmjs.com/package/@blockfrost/blockfrost-js): Used to interact with the Cardano blockchain
- [Jest](https://jestjs.io/): Used as the testing framework
- [Docker](https://www.docker.com/): Used to containerize the application for production

## Install and Setup

1. Install [Node.js](https://nodejs.org/en/download/)
2. Clone this repository, and using a terminal navigate to its directory.
3. Run `yarn` or `npm install` to install the dependencies.
5. Setup a local or online PostgreSQL database (Note: If you already installed the Masumi Payment Service this should be the same PostgreSQL database)
6. Configure the environment variables by copying the `.env.example` file to `.env`or `.env.local` and setup the variables
   - DATABASE_URL: The endpoint for a PostgreSQL database to be used
   - PORT: The port to run the server on (default is 3001)
7. If you're setting up the database for the first time also set the following variables:
   - BLOCKFROST_API_KEY: An API Key from [https://blockfrost.io/](https://blockfrost.io/) for the correct blockchain network, you can create this for free
   - REGISTRY_SOURCE_NETWORK: PREPROD or MAINNET
   - ADMIN_KEY: The key of the admin user, this key will have all permissions and can create new api_keys
8. If you're setting up the database for the first time also run run `yarn prisma:migrate` or `npm run prisma:migrate` otherwise run `yarn prisma:generate` or `npm run prisma:generate` to generate the prisma client (only works after installing the dependencies via step 3)
9. If you're setting up the database for the first time run `yarn prisma:seed` or `npm prisma:seed` to seed the database

## Build & Run

1. Make sure that the content of the `.env.example` file is copied to a `.env` file, and edited it with your values. This should already be covered in the "Install and Setup"
2. Run `yarn build` or `npm build` to build the files.
3. Run `yarn start` or `npm start` to start the application.

- You can run `yarn dev` or `npm dev` to combine the 2 steps above, while listening to changes and restarting automatically.

To verify that the application is working correctly, point your browser to
[http://localhost:3000/api/v1/health](http://localhost:3000/api/health) - you
should see a response with one books in JSON format.

You can see a OpenAPI (Swagger) definition of the REST API at
[http://localhost:3000/docs/](http://localhost:3000/docs/). This
interface also allows you to interact with the API.

## Run with Docker

1. Please ensure to follow the setup if you have not migrated and/or seeded the database, also ensure to setup the environment variables, described in the previous sections (by default it tries to copy the `.env` file and use it)
2. Build:

   ```
   docker build -t masumi-registry-service .
   ```

3. Run:

   ```
   docker run -d -p 3001:3001 masumi-registry-service
   ```

   Replacing `masumi-registry-service` with the image name, and `3001:3001` with the `host:container` ports configured in the environment variables.

4. Congratulations, you have now a running production instance of the Masumi Registry Service!

## Configuration

Currently you can configure various parameters via the swagger playground.

## Developing

### Visual Studio Code

- Installing the Eslint (`dbaeumer.vscode-eslint`) and Prettier - Code formatter (`esbenp.prettier-vscode`) extensions is recommended.

## Linting & Formatting

- Run `yarn lint` or `npm lint` to lint the code.
- Run `yarn format` or `npm format` to format the code.

## Testing

This project uses Jest as the testing framework. Here's how you can run tests:

- Run `yarn test` or `npm test` to execute all tests.
- Run `yarn test:watch` or `npm test:watch` to run tests in watch mode, which will re-run tests on file changes.
- Run `yarn test:coverage` or `npm test:coverage` to see the test coverage report.

### Writing Tests

Tests are located in the `src` directory, alongside the files they are testing. Test files should follow the naming convention of `*.spec.ts` or `*.test.ts`.

### Folder structure

```
/src
    /routes
    /services
    /repositories
    /utils
```

The source folder contains sub-folders that arrange the application into logical
layers

- `routes:` This is the adapter layer of architecture. It defines the HTTP requests structures from and to the external world and the services layers.

- `services`: The service layer coordinates high-level activities such as
  creation of domain objects and asking them to perform tasks requested by the
  external world. It interacts with the repository layer to save and restore
  objects.

- `repositories`: The repository layer is responsible for persisting domain
  objects and performing CRUD operations on them. We use SQL to persist the
  changes

- The `utils` folder contains useful utilities and helpers.

## Roadmap

- [x] REST API to query and filter the registry
- [x] REST API to query available capabilities in the registry
- [x] Swagger UI as API documentation
- [x] API Key system with different permissions and crediting system to access the registry (enables registry as a service)
- [x] Support for multiple blockchain networks and registry sources
- [x] Caching of registry entries
- [x] Periodic updating of the registry entries
- [ ] Better test coverage
- [ ] Improve documentation
- [ ] Code cleanup
- [ ] Admin UI to manage the registry
