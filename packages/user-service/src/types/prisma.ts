import { PrismaClient } from '@prisma/client';
export * from '@prisma/client';

declare global {
    var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

// Define user type without sensitive fields
export type UserType = Omit<NonNullable<Awaited<ReturnType<PrismaClient['user']['findUnique']>>>, 'password'>;
