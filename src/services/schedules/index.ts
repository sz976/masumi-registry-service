import {
  updateLatestCardanoRegistryEntries,
  updateDeregisteredCardanoRegistryEntries,
  updateHealthCheck,
} from '@/services/cardano-registry/cardano-registry.service';
import { CONFIG } from '@/utils/config';
import { logger } from '@/utils/logger';
import { AsyncInterval } from '@/utils/async-interval';

async function init() {
  logger.log({
    level: 'info',
    message: 'initialized cron events',
  });
  await new Promise((resolve) => setTimeout(resolve, 1500));
  AsyncInterval.start(async () => {
    logger.info('updating cardano registry entries');
    const start = new Date();
    await updateLatestCardanoRegistryEntries(start);
    logger.info(
      'finished updating cardano registry entries in ' +
        (new Date().getTime() - start.getTime()) / 1000 +
        's'
    );
  }, CONFIG.UPDATE_CARDANO_REGISTRY_INTERVAL * 1000);

  await new Promise((resolve) => setTimeout(resolve, 1500));
  AsyncInterval.start(async () => {
    logger.info('updating cardano deregistered entries');
    const start = new Date();
    await updateDeregisteredCardanoRegistryEntries();
    logger.info(
      'finished updating cardano deregistered entries in ' +
        (new Date().getTime() - start.getTime()) / 1000 +
        's'
    );
  }, CONFIG.UPDATE_CARDANO_DEREGISTER_INTERVAL * 1000);

  await new Promise((resolve) => setTimeout(resolve, 15000));
  AsyncInterval.start(async () => {
    logger.info('updating health check');
    const start = new Date();
    await updateHealthCheck();
    logger.info(
      'finished updating health check in ' +
        (new Date().getTime() - start.getTime()) / 1000 +
        's'
    );
  }, CONFIG.UPDATE_HEALTH_CHECK_INTERVAL * 1000);
}
export default init;
