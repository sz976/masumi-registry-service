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
    '0b3b0cabb905e22826890c5119305d36f831906b57a8e28d480015ad',
  REGISTRY_POLICY_ID_Mainnet:
    '8b365f60ed98237bbb499f28955a597bfd1fe5129e49c003795963f8',
  METADATA_VERSION: 1,
};
