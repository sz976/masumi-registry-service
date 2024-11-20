import { PrismaClient } from "@prisma/client";
import { defaultEndpointsFactory } from "express-zod-api";

export const prisma = new PrismaClient({
    //log: ["query", "info", "warn", "error"]
});

//@ts-ignore
/*prisma.$on('query', (e) => {
    //@ts-ignore
    console.log('Query: ' + e.query)
    //@ts-ignore
    console.log('Params: ' + e.params)
    //@ts-ignore
    console.log('Duration: ' + e.duration + 'ms')
})*/


export async function cleanupDB() {
    await prisma.$disconnect()
}

export async function initDB() {
    await prisma.$connect()
}
