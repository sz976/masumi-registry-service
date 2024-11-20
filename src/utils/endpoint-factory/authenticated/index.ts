import { defaultEndpointsFactory } from "express-zod-api";
import { authMiddleware } from "@/utils/middleware/auth-middleware";
import { prisma } from "@/utils/db";

export const authenticatedEndpointFactory = defaultEndpointsFactory.addMiddleware(authMiddleware(false))