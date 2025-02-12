import * as dotenv from "dotenv";
dotenv.config();

if (process.env.DATABASE_URL == null)
    throw new Error("Undefined DATABASE_URL ENV variables")


export const CONFIG = {
    PORT: process.env.PORT ?? "3000",
    DATABASE_URL: process.env.DATABASE_URL,
    UPDATE_CARDANO_REGISTRY_INTERVAL: Number(process.env.UPDATE_CARDANO_REGISTRY_INTERVAL ?? "300000"),
    UPDATE_CARDANO_DEREGISTER_INTERVAL: Number(process.env.UPDATE_CARDANO_DEREGISTER_INTERVAL ?? "300000"),
    VERSION: "0.1.2"
};