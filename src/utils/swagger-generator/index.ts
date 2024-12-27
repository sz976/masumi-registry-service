import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { healthResponseSchema } from "@/routes/api/health";
import { queryRegistrySchemaInput, queryRegistrySchemaOutput } from "@/routes/api/registry-entry";
import cuid2 from "@paralleldrive/cuid2";
import { capabilitySchemaInput, capabilitySchemaOutput } from "@/routes/api/capability";
import {
  addAPIKeySchemaOutput,
  addAPIKeySchemaInput,
  getAPIKeySchemaInput,
  getAPIKeySchemaOutput,
  updateAPIKeySchemaOutput,
  updateAPIKeySchemaInput,
  deleteAPIKeySchemaOutput,
  deleteAPIKeySchemaInput,
} from "@/routes/api/api-key";
import {
  getRegistrySourceSchemaInput,
  getRegistrySourceSchemaOutput,
  addRegistrySourceSchemaInput,
  addRegistrySourceSchemaOutput,
  updateRegistrySourceSchemaInput,
  deleteRegistrySourceSchemaInput,
  deleteRegistrySourceSchemaOutput,
  updateRegistrySourceSchemaOutput,
} from "@/routes/api/registry-source";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();
export function generateOpenAPI() {
  const apiKeyAuth = registry.registerComponent("securitySchemes", "API-Key", {
    type: "apiKey",
    in: "header",
    name: "token",
    description: "API key authentication via header (token)",
  });

  registry.registerPath({
    method: "get",
    path: "/health/",
    summary: "Get the status of the API server",
    request: {},
    responses: {
      200: {
        description: "Object with health and version information.",
        content: {
          "application/json": {
            schema: z
              .object({ data: healthResponseSchema, status: z.string() })
              .openapi({ example: { data: { type: "masumi-registry", version: "0.1.2" }, status: "success" } }),
          },
        },
      },
    },
  });

  /************************** Entries **************************/

  registry.registerPath({
    method: "get",
    path: "/registry-entry/",
    description:
      "Query the registry for available and online (health-checked) entries. Registry filter, allows pagination, filtering by payment type and capability and optional date filters (to force update any entries checked before the specified date. Warning: this might take a bit of time as response is not cached)",
    summary: "REQUIRES API KEY Authentication (+user)",
    tags: ["registry-entry"],
    request: {
      query: queryRegistrySchemaInput.openapi({
        example: {
          //allowCentralizedPayment: true,
          //allowDecentralizedPayment: true,
          limit: 10,
          capability: {
            name: "Example Capability",
            version: "Optional version",
          },
          cursorId: "last_paginated_item",
          minRegistryDate: new Date().toISOString(),
          minHealthCheckDate: new Date().toISOString(),
        },
      }),
    },
    security: [{ [apiKeyAuth.name]: [] }],
    responses: {
      200: {
        description: "Registry entries",
        content: {
          "application/json": {
            schema: z.object({ data: queryRegistrySchemaOutput, status: z.string() }).openapi({
              example: {
                data: {
                  entries: [
                    {
                      name: "Example API",
                      description: "Example Capability description",
                      status: "ONLINE",
                      registry: {
                        type: "WEB3_CARDANO_V1",
                        identifier: "0000000000000000000000000000000000000000000000000000000000000000",
                        url: null,
                      },
                      author_contact: null,
                      author_name: null,
                      image: "testimage.de",
                      other_legal: null,
                      privacy_policy: null,
                      requests_per_hour: 15,
                      tags: null,
                      terms_and_condition: "If the answer is 42 what was the question",
                      uptimeCheckCount: 10,
                      uptimeCount: 8,
                      lastUptimeCheck: new Date(),
                      api_url: "https://localhost:3000/api/",
                      capability: {
                        name: "Example Capability",
                        version: "1.0.0",
                        description: "Example Capability description",
                      },
                      author_organization: "MASUMI",
                      identifier: "222222222222222222222222222222222222222222222222222222222222222222",
                      id: cuid2.createId(),
                      paymentIdentifier: [
                        {
                          paymentIdentifier: "addr1333333333333333333333333333333333333333333333333333333333333333",
                          paymentType: "WEB3_CARDANO_V1",
                        },
                      ],
                    },
                  ],
                },
                status: "success",
              },
            }),
          },
        },
      },
      400: {
        description: "Bad Request (possible parameters missing or invalid)",
      },
      401: {
        description: "Unauthorized",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  });
  /************************** Sources **************************/
  registry.registerPath({
    method: "get",
    path: "/registry-source/",
    description: "Gets all registry sources",
    summary: "REQUIRES API KEY Authentication (+admin)",
    tags: ["registry-source"],
    request: {
      query: getRegistrySourceSchemaInput.openapi({
        example: {
          limit: 10,
          cursorId: "optional_last_paginated_item",
        },
      }),
    },
    security: [{ [apiKeyAuth.name]: [] }],
    responses: {
      200: {
        description: "Registry sources",
        content: {
          "application/json": {
            schema: z.object({ data: getRegistrySourceSchemaOutput, status: z.string() }).openapi({
              example: {
                data: {
                  sources: [
                    {
                      id: "unique-cuid-v2-auto-generated",
                      type: "WEB3_CARDANO_V1",
                      identifier: "optional_identifier",
                      url: "optional_url",
                      note: "optional_note",
                      apiKey: "optional_apiKey",
                      network: "PREVIEW",
                      latestPage: 1,
                      latestIdentifier: "optional_latestIdentifier",
                    },
                  ],
                },
                status: "success",
              },
            }),
          },
        },
      },
    },
  });
  registry.registerPath({
    method: "post",
    path: "/registry-source/",
    description: "Creates a new registry source",
    summary: "REQUIRES API KEY Authentication (+admin)",
    tags: ["registry-source"],
    request: {
      body: {
        description: "",
        content: {
          "application/json": {
            schema: addRegistrySourceSchemaInput.openapi({
              example: {
                type: "WEB3_CARDANO_V1",
                identifier: "optional_identifier",
                note: "optional_note",
                apiKey: "apiKey",
                network: "PREVIEW",
              },
            }),
          },
        },
      },
    },
    security: [{ [apiKeyAuth.name]: [] }],
    responses: {
      200: {
        description: "Registry source",
        content: {
          "application/json": {
            schema: z.object({ data: addRegistrySourceSchemaOutput, status: z.string() }).openapi({
              example: {
                data: {
                  id: "unique-cuid-v2-auto-generated",
                },
                status: "success",
              },
            }),
          },
        },
      },
    },
  });
  registry.registerPath({
    method: "patch",
    path: "/registry-source/",
    description: "Updates a registry source",
    summary: "REQUIRES API KEY Authentication (+admin)",
    tags: ["registry-source"],
    request: {
      body: {
        description: "",
        content: {
          "application/json": {
            schema: updateRegistrySourceSchemaInput.openapi({
              example: {
                id: "unique-cuid-v2-auto-generated",
                note: "optional_note",
                apiKey: "optional_apiKey",
              },
            }),
          },
        },
      },
    },
    security: [{ [apiKeyAuth.name]: [] }],
    responses: {
      200: {
        description: "Registry source",
        content: {
          "application/json": {
            schema: z.object({ data: updateRegistrySourceSchemaOutput, status: z.string() }).openapi({
              example: {
                data: {
                  id: "unique-cuid-v2-auto-generated",
                },
                status: "success",
              },
            }),
          },
        },
      },
    },
  });
  registry.registerPath({
    method: "delete",
    path: "/registry-source/",
    description: "Updates a registry source",
    summary: "REQUIRES API KEY Authentication (+admin)",
    tags: ["registry-source"],
    request: {
      body: {
        description: "",
        content: {
          "application/json": {
            schema: deleteRegistrySourceSchemaInput.openapi({
              example: {
                id: "unique-cuid-v2-auto-generated",
              },
            }),
          },
        },
      },
    },
    security: [{ [apiKeyAuth.name]: [] }],
    responses: {
      200: {
        description: "Registry source",
        content: {
          "application/json": {
            schema: z.object({ data: deleteRegistrySourceSchemaOutput, status: z.string() }).openapi({
              example: {
                data: {
                  id: "unique-cuid-v2-auto-generated",
                },
                status: "success",
              },
            }),
          },
        },
      },
    },
  });
  /************************** Capabilities **************************/
  registry.registerPath({
    method: "get",
    path: "/capability/",
    description: "Gets all capabilities that are currently online",
    summary: "REQUIRES API KEY Authentication (+user)",
    tags: ["capability"],
    request: {
      query: capabilitySchemaInput.openapi({
        example: {
          limit: 10,
          cursorId: "last_paginated_item",
        },
      }),
    },
    security: [{ [apiKeyAuth.name]: [] }],
    responses: {
      200: {
        description: "Registry entries",
        content: {
          "application/json": {
            schema: z.object({ data: capabilitySchemaOutput, status: z.string() }).openapi({
              example: {
                data: {
                  capabilities: [
                    {
                      id: "unique-cuid-v2-auto-generated",
                      name: "Example Capability",
                      version: "1.0.0",
                    },
                  ],
                },
                status: "success",
              },
            }),
          },
        },
      },
      400: {
        description: "Bad Request (possible parameters missing or invalid)",
      },
      401: {
        description: "Unauthorized",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  });

  /************************** API Key **************************/
  registry.registerPath({
    method: "get",
    path: "/api-key/",
    description: "Gets registry sources, can be paginated",
    summary: "REQUIRES API KEY Authentication (+admin)",
    tags: ["api-key"],
    request: {
      query: getAPIKeySchemaInput.openapi({
        example: {
          id: "id_or_apiKey_unique-cuid-v2-of-entry-to-search",
          apiKey: "id_or_apiKey_api-key-to-search",
        },
      }),
    },
    security: [{ [apiKeyAuth.name]: [] }],
    responses: {
      200: {
        description: "Registry entries",
        content: {
          "application/json": {
            schema: z.object({ data: getAPIKeySchemaOutput, status: z.string() }).openapi({
              example: {
                data: {
                  id: "unique-cuid-v2-auto-generated",
                  apiKey: "masumi-registry-api-key-secret",
                  permission: "ADMIN",
                  usageLimited: true,
                  maxUsageCredits: 1000000,
                  accumulatedUsageCredits: 0,
                  status: "ACTIVE",
                },
                status: "success",
              },
            }),
          },
        },
      },
      400: {
        description: "Bad Request (possible parameters missing or invalid)",
      },
      401: {
        description: "Unauthorized",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api-key/",
    description: "Create a new API key",
    summary: "REQUIRES API KEY Authentication (+admin)",
    tags: ["api-key"],
    request: {
      body: {
        description: "",
        content: {
          "application/json": {
            schema: addAPIKeySchemaInput.openapi({
              example: {
                permission: "ADMIN",
                usageLimited: true,
                maxUsageCredits: 1000000,
              },
            }),
          },
        },
      },
    },
    security: [{ [apiKeyAuth.name]: [] }],
    responses: {
      200: {
        description: "API Key",
        content: {
          "application/json": {
            schema: z.object({ data: addAPIKeySchemaOutput, status: z.string() }).openapi({
              example: {
                data: {
                  id: "unique-cuid-v2-auto-generated",
                  status: "ACTIVE",
                  apiKey: "masumi-registry-api-key-secret",
                  permission: "USER",
                  usageLimited: true,
                  maxUsageCredits: 1000000,
                  accumulatedUsageCredits: 0,
                },
                status: "success",
              },
            }),
          },
        },
      },
      400: {
        description: "Bad Request (possible parameters missing or invalid)",
      },
      401: {
        description: "Unauthorized",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/api-key/",
    description: "Updates a API key",
    summary: "REQUIRES API KEY Authentication (+admin)",
    tags: ["api-key"],
    request: {
      body: {
        description: "Undefined fields will not be changed",
        content: {
          "application/json": {
            schema: updateAPIKeySchemaInput.openapi({
              example: {
                id: "id_or_apiKey_unique-cuid-v2-of-entry-to-update",
                apiKey: "id_or_apiKey_api-key-to-update",
                usageLimited: true,
                maxUsageCredits: 1000000,
              },
            }),
          },
        },
      },
    },
    security: [{ [apiKeyAuth.name]: [] }],
    responses: {
      200: {
        description: "Registry entries",
        content: {
          "application/json": {
            schema: z.object({ data: updateAPIKeySchemaOutput, status: z.string() }).openapi({
              example: {
                data: {
                  id: "unique-cuid-v2-auto-generated",
                  apiKey: "masumi-registry-api-key-secret",
                  permission: "USER",
                  usageLimited: true,
                  maxUsageCredits: 1000000,
                  accumulatedUsageCredits: 0,
                  status: "ACTIVE",
                },
                status: "success",
              },
            }),
          },
        },
      },
      400: {
        description: "Bad Request (possible parameters missing or invalid)",
      },
      401: {
        description: "Unauthorized",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/api-key/",
    description: "Removes a API key",
    summary: "REQUIRES API KEY Authentication (+admin)",
    tags: ["api-key"],
    request: {
      body: {
        description: "",
        content: {
          "application/json": {
            schema: deleteAPIKeySchemaInput.openapi({
              example: {
                id: "id_or_apiKey_unique-cuid-v2-of-entry-to-delete",
                apiKey: "id_or_apiKey_api-key-to-delete",
              },
            }),
          },
        },
      },
    },
    security: [{ [apiKeyAuth.name]: [] }],
    responses: {
      200: {
        description: "Registry entries",
        content: {
          "application/json": {
            schema: z.object({ data: deleteAPIKeySchemaOutput, status: z.string() }).openapi({
              example: {
                data: {
                  id: "unique-cuid-v2-of-entry-to-delete",
                  apiKey: "id_or_apiKey_api-key-to-delete",
                },
                status: "success",
              },
            }),
          },
        },
      },
      400: {
        description: "Bad Request (possible parameters missing or invalid)",
      },
      401: {
        description: "Unauthorized",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  });

  return new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Template API",
      description: "This is the default API from a template",
    },

    servers: [{ url: "./../api/v1/" }],
  });
}
