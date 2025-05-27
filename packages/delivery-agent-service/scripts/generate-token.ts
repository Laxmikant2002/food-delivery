import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

config();

const prisma = new PrismaClient();

async function generateToken() {
  try {
    // Create a test delivery agent if it doesn't exist
    const testAgent = await prisma.deliveryAgent.upsert({
      where: {
        email: 'test.agent@example.com',
      },
      update: {},
      create: {
        email: 'test.agent@example.com',
        password: 'test123', // In production, this should be hashed
        name: 'Test Agent',
        isOnline: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { agentId: testAgent.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    console.log('Test Delivery Agent created:');
    console.log('ID:', testAgent.id);
    console.log('Email:', testAgent.email);
    console.log('\nJWT Token:');
    console.log(token);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateToken();
