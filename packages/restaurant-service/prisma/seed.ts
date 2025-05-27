import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a test restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Test Restaurant',
      isOnline: true,
      availabilityStart: new Date(Date.UTC(2000, 0, 1, 9, 0, 0)), // 9 AM
      availabilityEnd: new Date(Date.UTC(2000, 0, 1, 23, 0, 0)), // 11 PM
    }
  });

  // Create some menu items
  const menuItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: 'Margherita Pizza',
        description: 'Classic tomato and mozzarella pizza',
        price: 12.99,
        restaurantId: restaurant.id,
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Pasta Carbonara',
        description: 'Creamy pasta with bacon and egg',
        price: 14.99,
        restaurantId: restaurant.id,
      }
    })
  ]);

  console.log('Created test data:', {
    restaurant,
    menuItems
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
