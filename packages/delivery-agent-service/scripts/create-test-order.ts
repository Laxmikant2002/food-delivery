import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config();

const prisma = new PrismaClient();

async function createTestOrder() {
  try {
    // First, ensure we have our test delivery agent
    const testAgent = await prisma.deliveryAgent.findUnique({
      where: {
        email: 'test.agent@example.com'
      }
    });

    if (!testAgent) {
      throw new Error('Test delivery agent not found. Please run generate-token.ts first.');
    }

    // Create a test order
    const order = await prisma.order.create({
      data: {
        status: 'PENDING',
        restaurantId: '00000000-0000-0000-0000-000000000001', // dummy restaurant ID
        userId: '00000000-0000-0000-0000-000000000001', // dummy user ID
        deliveryAgentId: testAgent.id,
        pickupAddress: '123 Restaurant St',
        deliveryAddress: '456 Customer Ave',
        deliveryNotes: 'Test order for delivery status updates'
      }
    });

    console.log('Test Order created:');
    console.log('Order ID:', order.id);
    console.log('Status:', order.status);
    console.log('Delivery Agent ID:', order.deliveryAgentId);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrder();
