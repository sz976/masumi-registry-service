import * as dotenv from 'dotenv';
dotenv.config();

if (process.env.DATABASE_URL == null)
  throw new Error('Undefined DATABASE_URL ENV variables');

const updateCardanoRegistryInterval = Number(
  process.env.UPDATE_CARDANO_REGISTRY_INTERVAL ?? '50'
);
if (updateCardanoRegistryInterval < 20)
  throw new Error('Invalid UPDATE_CARDANO_REGISTRY_INTERVAL ENV variables');

const updateCardanoDeregisterInterval = Number(
  process.env.UPDATE_CARDANO_DEREGISTER_INTERVAL ?? '120'
);
if (updateCardanoDeregisterInterval < 20)
  throw new Error('Invalid UPDATE_CARDANO_DEREGISTER_INTERVAL ENV variables');

export const CONFIG = {
  PORT: process.env.PORT ?? '3000',
  DATABASE_URL: process.env.DATABASE_URL,
  UPDATE_CARDANO_REGISTRY_INTERVAL: updateCardanoRegistryInterval,
  UPDATE_CARDANO_DEREGISTER_INTERVAL: updateCardanoDeregisterInterval,
  VERSION: '0.1.2',
};

export const DEFAULTS = {
  REGISTRY_POLICY_ID_Preprod:
    'e6c57104dfa95943ffab95eafe1f12ed9a8da791678bfbf765b05649',
  REGISTRY_POLICY_ID_Mainnet:
    '1d2fcf188632b7dfc3d881c2215a0e94db3b6823996f64a86ec263ff',
  METADATA_VERSION: 1,
};
