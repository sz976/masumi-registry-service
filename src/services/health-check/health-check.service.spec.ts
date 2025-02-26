import { healthCheckService } from './health-check.service';
import { $Enums } from '@prisma/client';

describe('healthCheckService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('checkAndVerifyEndpoint', () => {
    const mockUrl = 'http://test.com';
    const mockIdentifier = 'test-id';
    const mockRegistryId = 'registry-id';

    it('should return Offline status when endpoint is not reachable', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const result = await healthCheckService.checkAndVerifyEndpoint({
        api_url: mockUrl,
        assetName: mockIdentifier,
        registry: {
          policyId: mockRegistryId,
          type: $Enums.RegistryEntryType.Web3CardanoV1,
        },
      });
      expect(result).toBe($Enums.Status.Offline);
    });

    it('should return Online status when decentralized verification succeeds', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            agentIdentifier: mockRegistryId + mockIdentifier,
            type: $Enums.RegistryEntryType.Web3CardanoV1,
          }),
      });

      const result = await healthCheckService.checkAndVerifyEndpoint({
        api_url: mockUrl,
        assetName: mockIdentifier,
        registry: {
          policyId: mockRegistryId,
          type: $Enums.RegistryEntryType.Web3CardanoV1,
        },
      });

      expect(result).toBe($Enums.Status.Online);
    });

    it('should return Invalid status when decentralized verification fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            identifier: 'wrong-id',
            registry: mockRegistryId,
            type: $Enums.RegistryEntryType.Web3CardanoV1,
          }),
      });

      const result = await healthCheckService.checkAndVerifyEndpoint({
        api_url: mockUrl,
        assetName: mockIdentifier,
        registry: {
          policyId: mockRegistryId,
          type: $Enums.RegistryEntryType.Web3CardanoV1,
        },
      });

      expect(result).toBe($Enums.Status.Invalid);
    });
  });
});
describe('checkAndVerifyRegistryEntry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should return existing status if lastUptimeCheck is newer than minHealthCheckDate', async () => {
    const mockRegistryEntry = {
      assetName: 'test-id',
      lastUptimeCheck: new Date(Date.now() - 200),
      apiUrl: 'http://test.com',
      status: $Enums.Status.Online,
      RegistrySource: {
        policyId: 'registry-id',
        type: $Enums.RegistryEntryType.Web3CardanoV1,
      },
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });
    const minHealthCheckDate = new Date(Date.now() - 1000); // 1 second ago
    mockRegistryEntry.lastUptimeCheck = new Date(); // current time

    const result = await healthCheckService.checkAndVerifyRegistryEntry({
      registryEntry: mockRegistryEntry,
      minHealthCheckDate,
    });

    expect(result).toBe(mockRegistryEntry.status);
  });

  it('should check endpoint if lastUptimeCheck is older than minHealthCheckDate', async () => {
    const minHealthCheckDate = new Date();
    const mockRegistryEntry = {
      assetName: 'assetname',
      lastUptimeCheck: new Date(Date.now() - 200),
      apiUrl: 'http://test.com',
      status: $Enums.Status.Offline,
      RegistrySource: {
        policyId: 'registry',
        type: $Enums.RegistryEntryType.Web3CardanoV1,
      },
    };
    mockRegistryEntry.lastUptimeCheck = new Date(Date.now() - 1000); // 1 second ago

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          agentIdentifier: 'registryassetname',
          type: $Enums.RegistryEntryType.Web3CardanoV1,
        }),
    });

    const result = await healthCheckService.checkAndVerifyRegistryEntry({
      registryEntry: mockRegistryEntry,
      minHealthCheckDate,
    });

    expect(result).toBe($Enums.Status.Online);
  });

  it('should not check endpoint if minHealthCheckDate is undefined', async () => {
    const mockRegistryEntry = {
      assetName: 'test-id',
      lastUptimeCheck: new Date(Date.now() - 200),
      apiUrl: 'http://test.com',
      status: $Enums.Status.Online,
      RegistrySource: {
        policyId: 'registry-id',
        type: $Enums.RegistryEntryType.Web3CardanoV1,
      },
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const result = await healthCheckService.checkAndVerifyRegistryEntry({
      registryEntry: mockRegistryEntry,
      minHealthCheckDate: undefined,
    });

    expect(result).toBe($Enums.Status.Online);
  });

  it('should return Offline status when endpoint check fails', async () => {
    const mockRegistryEntry = {
      assetName: 'test-id',
      lastUptimeCheck: new Date(Date.now() - 200),
      apiUrl: 'http://test.com',
      status: $Enums.Status.Online,
      RegistrySource: {
        policyId: 'registry-id',
        type: $Enums.RegistryEntryType.Web3CardanoV1,
      },
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const result = await healthCheckService.checkAndVerifyRegistryEntry({
      registryEntry: mockRegistryEntry,
      minHealthCheckDate: new Date(),
    });

    expect(result).toBe($Enums.Status.Offline);
  });
});
