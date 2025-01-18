import * as dotenv from "dotenv";
dotenv.config();

if (process.env.DATABASE_URL == null)
    throw new Error("Undefined DATABASE_URL ENV variables")
if (process.env.BLOCKFROST_API_KEY == null)
    throw new Error("Undefined BLOCKFROST_API_KEY in ENV variables")

export const CONFIG = {
    PORT: process.env.PORT ?? "3000",
    DATABASE_URL: process.env.DATABASE_URL,
    UPDATE_CARDANO_REGISTRY_INTERVAL: process.env.UPDATE_CARDANO_REGISTRY_INTERVAL,
    UPDATE_CARDANO_DEREGISTER_INTERVAL: process.env.UPDATE_CARDANO_DEREGISTER_INTERVAL,
    VERSION: "0.1.2"
};