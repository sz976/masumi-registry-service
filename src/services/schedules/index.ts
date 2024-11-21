import cron from "node-cron";
import { updateLatestCardanoRegistryEntries, updateDeregisteredCardanoRegistryEntries } from "@/services/cardano-registry/cardano-registry.service";
import { CONFIG } from "@/utils/config";
import { logger } from '@/utils/logger';

async function init() {
    logger.log({
        level: "info",
        message: "initialized cron events",
    });
    if (CONFIG.UPDATE_CARDANO_REGISTRY_INTERVAL != null) {
        cron.schedule(CONFIG.UPDATE_CARDANO_REGISTRY_INTERVAL, async () => {
            logger.info("updating cardano registry entries")
            const start = new Date()
            await updateLatestCardanoRegistryEntries(start)
            logger.info("finished updating cardano registry entries in " + (new Date().getTime() - start.getTime()) / 1000 + "s")
        });
    }
    if (CONFIG.UPDATE_CARDANO_DEREGISTER_INTERVAL != null) {
        cron.schedule(CONFIG.UPDATE_CARDANO_DEREGISTER_INTERVAL, async () => {
            logger.info("updating cardano deregistered entries")
            const start = new Date()
            await updateDeregisteredCardanoRegistryEntries()
            logger.info("finished updating cardano deregistered entries in " + (new Date().getTime() - start.getTime()) / 1000 + "s")
        });
    }


}
export default init;