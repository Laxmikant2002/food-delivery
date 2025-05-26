import request from 'supertest';
import { app } from '../src/index'; // Adjust the import based on your actual app export

describe('Restaurant Service', () => {
  it('should return a list of restaurants', async () => {
    const response = await request(app).get('/restaurants'); // Adjust the endpoint as necessary
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should create a new restaurant', async () => {
    const newRestaurant = {
      name: 'Test Restaurant',
      location: 'Test Location',
      cuisine: 'Test Cuisine',
    };

    const response = await request(app).post('/restaurants').send(newRestaurant); // Adjust the endpoint as necessary
    expect(response.status).toBe(201);
    expect(response.body.name).toBe(newRestaurant.name);
  });

  // Add more tests as needed
});