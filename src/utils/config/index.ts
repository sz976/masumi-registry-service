import * as dotenv from "dotenv";
dotenv.config();

if (process.env.DATABASE_URL == null)
    throw new Error("Undefined DATABASE_URL ENV variables")


export const CONFIG = {
    PORT: process.env.PORT ?? "3000",
    DATABASE_URL: process.env.DATABASE_URL,
    UPDATE_CARDANO_REGISTRY_INTERVAL: process.env.UPDATE_CARDANO_REGISTRY_INTERVAL ?? "*/3 * * * *",
    UPDATE_CARDANO_DEREGISTER_INTERVAL: process.env.UPDATE_CARDANO_DEREGISTER_INTERVAL ?? "*/3 * * * *",
    VERSION: "0.1.2"
};