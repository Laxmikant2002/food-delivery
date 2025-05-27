import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

config();

const prisma = new PrismaClient();

async function generateToken() {
  try {
    // Create or update the test delivery agent
    const agent = await prisma.$queryRaw`
      INSERT INTO delivery_agents (id, email, password, name, "isOnline", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'test.agent@example.com',
        'test123',
        'Test Agent',
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) 
      DO UPDATE SET
        "isOnline" = true,
        "updatedAt" = NOW()
      RETURNING *;
    `;

    if (Array.isArray(agent) && agent.length > 0) {
      const deliveryAgent = agent[0];

      // Generate JWT token
      const token = jwt.sign(
        { agentId: deliveryAgent.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      console.log('Test Delivery Agent:');
      console.log('ID:', deliveryAgent.id);
      console.log('Email:', deliveryAgent.email);
      console.log('\nJWT Token:');
      console.log(token);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateToken();
