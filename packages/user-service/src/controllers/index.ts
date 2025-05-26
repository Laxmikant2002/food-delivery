import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcrypt';

const prisma = new PrismaClient();

export class UserController {
    // Get all users
    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true
                }
            });
            return res.json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }
    }

    // Create a new user
    async createUser(req: Request, res: Response) {
        try {
            const { email, password, name } = req.body;

            // Basic validation
            if (!email || !password || !name) {
                return res.status(400).json({ error: 'Email, password, and name are required' });
            }

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                return res.status(409).json({ error: 'User with this email already exists' });
            }

            // Hash password
            const hashedPassword = await hash(password, 10);

            // Create user
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name
                },
                select: {
                    id: true,
                    email: true,
                    name: true
                }
            });

            return res.status(201).json(user);
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Failed to create user' });
        }
    }

    // Get user by ID
    async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            const user = await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    name: true
                }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            return res.json(user);
        } catch (error) {
            console.error('Error fetching user:', error);
            return res.status(500).json({ error: 'Failed to fetch user' });
        }
    }

    // Update user
    async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { email, name } = req.body;

            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { id }
            });

            if (!existingUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Update user
            const user = await prisma.user.update({
                where: { id },
                data: {
                    ...(email && { email }),
                    ...(name && { name })
                },
                select: {
                    id: true,
                    email: true,
                    name: true
                }
            });

            return res.json(user);
        } catch (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ error: 'Failed to update user' });
        }
    }

    // Delete user
    async deleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { id }
            });

            if (!existingUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Delete user
            await prisma.user.delete({
                where: { id }
            });

            return res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            return res.status(500).json({ error: 'Failed to delete user' });
        }
    }

    // Method to update user profile
    async updateProfile(req: Request, res: Response) {
        // Logic to update user profile here
    }

    // Method to delete user account
    async deleteAccount(req: Request, res: Response) {
        // Logic to delete user account here
    }
}