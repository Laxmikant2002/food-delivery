import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function generateToken() {
  // Get the first restaurant from the database
  const restaurant = await prisma.restaurant.findFirst();
  
  if (!restaurant) {
    console.error('No restaurant found in database. Please run seed script first.');
    process.exit(1);
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  const testToken = jwt.sign(
    { restaurantId: restaurant.id },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  console.log('Restaurant ID:', restaurant.id);
  console.log('Restaurant Name:', restaurant.name);
  console.log('\nTest JWT Token:', testToken);
  console.log('\nFor Postman, use this in the Authorization header:');
  console.log(`Bearer ${testToken}`);
}

generateToken()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
