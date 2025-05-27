import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestOrder() {
  try {
    // Get the first restaurant
    const restaurant = await prisma.restaurant.findFirst({
      include: {
        menuItems: true
      }
    });

    if (!restaurant) {
      console.error('No restaurant found');
      return;
    }

    // Create a test order
    const order = await prisma.order.create({
      data: {
        restaurantId: restaurant.id,
        status: OrderStatus.PENDING,
        total: restaurant.menuItems[0].price,
        items: {
          create: [
            {
              quantity: 1,
              menuItem: {
                connect: {
                  id: restaurant.menuItems[0].id
                }
              }
            }
          ]
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    console.log('Created test order:', {
      orderId: order.id,
      restaurantId: restaurant.id,
      status: order.status,
      total: order.total
    });
  } catch (error) {
    console.error('Error creating test order:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrder();
