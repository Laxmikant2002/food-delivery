import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function main() {
  try {
    // Create delivery agent
    const agent = await prisma.$queryRaw`
      INSERT INTO delivery_agents (id, email, password, name, "isOnline", location, "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'test.agent@example.com',
        'hashed_password_here',
        'Test Agent',
        true,
        '{"latitude": 40.7128, "longitude": -74.0060}'::jsonb,
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    if (Array.isArray(agent) && agent.length > 0) {
      const deliveryAgent = agent[0];
      
      // Create test order
      const order = await prisma.$queryRaw`
        INSERT INTO orders (
          id, status, "restaurantId", "userId", "deliveryAgentId",
          "pickupAddress", "deliveryAddress", "deliveryNotes",
          "createdAt", "updatedAt"
        )
        VALUES (
          gen_random_uuid(),
          'PENDING',
          'b60a39b2-a66f-4324-ac44-d65037dae49f'::uuid,
          '83d30442-c9bb-4cb5-b7c1-26440ffd286b'::uuid,
          ${deliveryAgent.id}::uuid,
          '123 Restaurant St',
          '456 Customer Ave',
          'Please ring doorbell',
          NOW(),
          NOW()
        )
        RETURNING *;
      `;

      // Generate JWT token for the agent
      const token = jwt.sign(
        { agentId: deliveryAgent.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      console.log('\nTest Data Created Successfully!');
      console.log('\nDelivery Agent:');
      console.log(deliveryAgent);
      console.log('\nTest Order:');
      console.log(order);
      console.log('\nAuth Token:');
      console.log(token);
    }
  } catch (error) {
    console.error('Error creating test data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
