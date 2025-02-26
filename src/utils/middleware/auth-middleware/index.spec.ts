/* eslint-disable @typescript-eslint/no-require-imports */
import { testMiddleware } from 'express-zod-api';
import { authMiddleware } from './index';
import { $Enums } from '@prisma/client';

jest.mock('@/utils/db', () => ({
  prisma: {
    apiKey: {
      findUnique: jest.fn(),
    },
  },
}));

describe('authMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw 401 if no token provided', async () => {
    await expect(
      testMiddleware({
        middleware: authMiddleware(false),
        requestProps: { method: 'POST', body: {}, headers: {} },
        options: {},
      })
    ).rejects.toThrow('No token provided');
  });
  it('should throw 401 if invalid token', async () => {
    const { prisma } = require('@/utils/db');
    (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      testMiddleware({
        middleware: authMiddleware(false),
        requestProps: {
          method: 'POST',
          body: {},
          headers: { token: 'invalid' },
        },
        options: {},
      })
    ).rejects.toThrow('Invalid token');
  });

  it('should throw 401 if admin required but user is not admin', async () => {
    const { prisma } = require('@/utils/db');
    (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      permission: $Enums.Permission.User,
      accumulatedUsageCredits: 0,
      maxUsageCredits: 100,
      status: $Enums.APIKeyStatus.Active,
      usageLimited: true,
    });

    await expect(
      testMiddleware({
        middleware: authMiddleware(true),
        requestProps: { method: 'POST', body: {}, headers: { token: 'valid' } },
        options: {},
      })
    ).rejects.toThrow('Unauthorized, admin access required');
  });
  it('should throw 401 if api key is inactive admin', async () => {
    const { prisma } = require('@/utils/db');
    (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      permission: $Enums.Permission.User,
      accumulatedUsageCredits: 0,
      maxUsageCredits: 100,
      status: $Enums.APIKeyStatus.Revoked,
      usageLimited: true,
    });

    await expect(
      testMiddleware({
        middleware: authMiddleware(false),
        requestProps: { method: 'POST', body: {}, headers: { token: 'valid' } },
        options: {},
      })
    ).rejects.toThrow('API key is revoked');
  });
  it('should throw 401 if api key is inactive admin', async () => {
    const { prisma } = require('@/utils/db');
    (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      permission: $Enums.Permission.Admin,
      accumulatedUsageCredits: 0,
      maxUsageCredits: 100,
      status: $Enums.APIKeyStatus.Revoked,
      usageLimited: true,
    });

    await expect(
      testMiddleware({
        middleware: authMiddleware(true),
        requestProps: { method: 'POST', body: {}, headers: { token: 'valid' } },
        options: {},
      })
    ).rejects.toThrow('API key is revoked');
  });

  it('should pass validation with valid user token', async () => {
    const mockApiKey = {
      id: 1,
      permission: $Enums.Permission.User,
      accumulatedUsageCredits: 0,
      status: $Enums.APIKeyStatus.Active,
      maxUsageCredits: 100,
      usageLimited: true,
    };
    const { prisma } = require('@/utils/db');
    (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue(mockApiKey);

    const { output } = await testMiddleware({
      middleware: authMiddleware(false),
      requestProps: { method: 'POST', body: {}, headers: { token: 'valid' } },
      options: {},
    });

    expect(output).toEqual({
      id: mockApiKey.id,
      permissions: [mockApiKey.permission],
      accumulatedUsageCredits: mockApiKey.accumulatedUsageCredits,
      maxUsageCredits: mockApiKey.maxUsageCredits,
      usageLimited: mockApiKey.usageLimited,
    });
  });

  it('should pass validation with valid admin token', async () => {
    const mockApiKey = {
      id: 1,
      permission: $Enums.Permission.Admin,
      accumulatedUsageCredits: 0,
      maxUsageCredits: 100,
      status: $Enums.APIKeyStatus.Active,
      usageLimited: true,
    };
    const { prisma } = require('@/utils/db');
    (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue(mockApiKey);

    const { output } = await testMiddleware({
      middleware: authMiddleware(true),
      requestProps: { method: 'POST', body: {}, headers: { token: 'valid' } },
      options: {},
    });

    expect(output).toEqual({
      id: mockApiKey.id,
      permissions: [mockApiKey.permission],
      accumulatedUsageCredits: mockApiKey.accumulatedUsageCredits,
      maxUsageCredits: mockApiKey.maxUsageCredits,
      usageLimited: mockApiKey.usageLimited,
    });
  });
});
