# User Service

This is the user service of the food delivery application. It is responsible for managing user-related functionalities such as registration, authentication, and user profile management.

## Getting Started

To get started with the user service, follow these steps:

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd food-delivery-monorepo/packages/user-service
   ```

2. **Install dependencies**:
   ```
   pnpm install
   ```

3. **Run the service**:
   ```
   pnpm start
   ```

## API Endpoints

- **POST /users/register**: Register a new user.
- **POST /users/login**: Authenticate a user.
- **GET /users/:id**: Retrieve user profile by ID.

## Testing

To run the tests for the user service, use the following command:

```
pnpm test
```

## Docker

To build and run the user service in a Docker container, use the following command:

```
docker build -t user-service .
docker run -p 3000:3000 user-service
```

## Prisma

This service uses Prisma for database interactions. Ensure that the PostgreSQL database is running and accessible. You can find the Prisma schema in the `prisma/schema.prisma` file.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.