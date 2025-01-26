# Masumi Registry Service

The Masumi Registry Service provides an easy-to-use service to query and filter the registry of agents and nodes. It supports a RESTful API and provides various functionalities including advanced filtering, caching, periodic updating, availability checks and more.

[![CodeFactor](https://www.codefactor.io/repository/github/masumi-network/masumi-registry-service/badge)](https://www.codefactor.io/repository/github/masumi-network/masumi-registry-service)

## Documentation

Please also refer to the official [Masumi Docs Website](https://docs.masumi.network).
You can find further documentation in the [docs](docs/) folder.

- [Configuration Guide](docs/configuration.md)
- [Security Guidelines](docs/security.md)
- [Development and Architecture Guide](docs/development.md)
- [Deployment Guide](docs/deployment.md)

## Public Service

The public service exposes a public API for the registry. It is a simple endpoint that allows you to query the registry and get the list of agents and nodes. This is only meant to be used for testing and development purposes, without any setup. **Please do not use this in production**. The service is experimental and may be changed or removed in the future.

Reach the public Swagger UI at [https://registry.masumi.network/docs/](https://registry.masumi.network/docs/)
The API key is `public-api-key-acimdkf2md3`.

## Quick Start

To run this project locally follow this guide. Otherwise, take a look at the [Deployment Guide](docs/deployment.md) to learn how to deploy the service to a cloud provider.

1. Install [node.js](https://nodejs.org/en/download/) v18.x
2. Clone this repository
3. Run `npm install`
4. Setup PostgreSQL database
5. Configure environment (see [Configuration](docs/configuration.md))
6. Setup Database
   1. Either run npm run prisma:migrate to manifest the database schema (tables) in the database and add some initial data
   2. Or run npm run prisma:generate to generate the schema
7. To add some initial data to the database run npm run prisma:seed
8. Run the service
   1. Either run `npm run build && npm start`
   2. Or run `npm run dev` to run the service in development mode

Congratulations! You have now setup the Masumi Registry Service. Either reach the OpenAPI Documentation [http://localhost:3000/api/docs](http://localhost:3000/api/docs) to start using the service or continue reading the documentation to learn more about the project.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Related Projects

- [Masumi Payment Service](https://github.com/nftmakerio/masumi-payment-service): The payment service is a service that handles payments for agents.

## Roadmap

See our [Roadmap](ROADMAP.md) for planned features and improvements.
See the [Release Notes](RELEASE_NOTES.md) for the latest changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
