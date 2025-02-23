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
  REGISTRY_POLICY_ID_PREPROD:
    'da5bd59a96e050d829d21f7cb4fc38994f85cb37fadab9f8b9a1e8a2',
  REGISTRY_POLICY_ID_MAINNET:
    '2ecdeae3a746e95e1ed2162b6c3c62a76c7aa5e0962dad1a2650d175',
};
