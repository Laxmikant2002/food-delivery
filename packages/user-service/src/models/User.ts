import { PrismaClient } from "@prisma/client";

export interface IUser {
    id: string;
    email: string;
    name: string;
    password?: string;
}

export class User implements Omit<IUser, 'password'> {
    id: string;
    email: string;
    name: string;

    constructor(userData: Omit<IUser, 'password'>) {
        this.id = userData.id;
        this.email = userData.email;
        this.name = userData.name;
    }

    static async findById(id: string, prisma: PrismaClient) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true
            }
        });
    }

    static async findByEmail(email: string, prisma: PrismaClient) {
        return prisma.user.findUnique({
            where: {email},
            select: {
                id: true,
                select: {
                    id: true,
                    email: true,
                    name: true
                }
            }
        });
    }
}