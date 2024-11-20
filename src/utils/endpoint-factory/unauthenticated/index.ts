import { prisma } from "@/utils/db";
import { defaultEndpointsFactory } from "express-zod-api";

export const unauthenticatedEndpointFactory = defaultEndpointsFactory