import { Middleware } from 'express-zod-api';
import createHttpError from 'http-errors';
import { prisma } from '@/utils/db';
import { z } from 'zod';
import { $Enums } from '@prisma/client';
import { hashToken } from '@/utils/crypto';

export const authMiddleware = (requiresAdmin: boolean) =>
  new Middleware({
    security: {
      // this information is optional and used for generating documentation
      type: 'header',
      name: 'api-key',
    },
    input: z.object({}),
    handler: async ({ request, logger }) => {
      logger.info('Checking the key and token');
      const sendKey = request.headers.token;
      if (!sendKey) {
        throw createHttpError(401, 'No token provided');
      }

      const apiKey = await prisma.apiKey.findUnique({
        where: {
          tokenHash: hashToken(sendKey as string),
        },
      });
      logger.info('Found api key', apiKey);

      if (!apiKey) {
        throw createHttpError(401, 'Invalid token');
      }

      if (apiKey.status !== $Enums.APIKeyStatus.Active) {
        throw createHttpError(401, 'API key is revoked');
      }

      if (requiresAdmin && apiKey.permission != $Enums.Permission.Admin) {
        throw createHttpError(401, 'Unauthorized, admin access required');
      }

      return {
        id: apiKey.id,
        permissions: [apiKey.permission],
        accumulatedUsageCredits: apiKey.accumulatedUsageCredits,
        maxUsageCredits: apiKey.maxUsageCredits,
        usageLimited: apiKey.usageLimited,
      }; // provides endpoints with options.user
    },
  });
