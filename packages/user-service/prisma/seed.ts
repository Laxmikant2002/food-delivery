import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    }
  });  // Create a test restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Test Restaurant',
      cuisine: ['Italian', 'Pizza'],
      isOnline: true,      availabilityStart: new Date(Date.UTC(2000, 0, 1, 9, 0, 0)),
      availabilityEnd: new Date(Date.UTC(2000, 0, 1, 23, 0, 0))
    }
  });
  // Create test menu items
  const margheritaPizza = await prisma.menuItem.create({
    data: {
      name: 'Margherita Pizza',
      description: 'Classic tomato and mozzarella pizza',
      price: 12.99,
      restaurantId: restaurant.id
    }
  });

  const pastaCarbonara = await prisma.menuItem.create({
    data: {
      name: 'Pasta Carbonara',
      description: 'Creamy pasta with bacon and egg',
      price: 14.99,
      restaurantId: restaurant.id
    }
  });

  console.log('Created test data:', { 
    user, 
    restaurant, 
    menuItems: [margheritaPizza, pastaCarbonara] 
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
