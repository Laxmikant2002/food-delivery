import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function main() {
  // Create a test delivery agent
  const agent = await prisma.deliveryAgent.upsert({
    where: { email: 'test.agent@example.com' },
    update: {},
    create: {
      email: 'test.agent@example.com',
      password: 'hashed_password_here', // In production, this should be properly hashed
      name: 'Test Agent',
      isOnline: true,
      location: { latitude: 40.7128, longitude: -74.0060 } // Example location
    }
  });

  // Create a test order assigned to this agent
  const order = await prisma.order.create({
    data: {
      restaurantId: 'b60a39b2-a66f-4324-ac44-d65037dae49f', // Use your existing restaurant ID
      userId: '83d30442-c9bb-4cb5-b7c1-26440ffd286b', // Use your existing user ID
      deliveryAgentId: agent.id,
      pickupAddress: '123 Restaurant St',
      deliveryAddress: '456 Customer Ave',
      deliveryNotes: 'Please ring doorbell',
      status: 'PENDING'
    }
  });

  // Generate JWT token for the agent
  const token = jwt.sign(
    { agentId: agent.id },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );

  console.log('\nTest Data Created Successfully!');
  console.log('\nDelivery Agent:');
  console.log(agent);
  console.log('\nTest Order:');
  console.log(order);
  console.log('\nAuth Token:');
  console.log(token);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
