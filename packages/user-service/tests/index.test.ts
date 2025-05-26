import request from 'supertest';
import app from '../src/index'; // Adjust the path as necessary

describe('User Service API', () => {
  it('should return a list of users', async () => {
    const response = await request(app).get('/users'); // Adjust the endpoint as necessary
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should create a new user', async () => {
    const newUser = { name: 'John Doe', email: 'john@example.com' }; // Adjust the user data as necessary
    const response = await request(app).post('/users').send(newUser);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(newUser.name);
  });

  // Add more tests as needed
});