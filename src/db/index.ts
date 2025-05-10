import { PrismaClient } from "../../generated/prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';
declare global {
  // eslint-disable-next-line
  var prisma: any;
}

export const prisma = globalThis.prisma || new PrismaClient().$extends(withAccelerate());
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export const db = prisma;