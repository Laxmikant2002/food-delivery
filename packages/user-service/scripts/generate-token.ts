import { sign } from 'jsonwebtoken';

const userId = '8a19f7a2-0ab3-4e7e-9edd-1bfc150d146b'; // Our test user ID
const token = sign({ userId }, 'user_service_secret');
console.log('JWT Token:', token);
