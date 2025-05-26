# Restaurant Service

This is the restaurant service of the food delivery application. It is responsible for managing restaurant-related operations, including adding, updating, and retrieving restaurant information.

## Getting Started

To get started with the restaurant service, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd food-delivery-monorepo/packages/restaurant-service
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Run the service**:
   ```bash
   pnpm start
   ```

## API Endpoints

The restaurant service exposes the following API endpoints:

- `GET /restaurants`: Retrieve a list of all restaurants.
- `POST /restaurants`: Add a new restaurant.
- `GET /restaurants/:id`: Retrieve details of a specific restaurant.
- `PUT /restaurants/:id`: Update a specific restaurant.
- `DELETE /restaurants/:id`: Delete a specific restaurant.

## Testing

To run tests for the restaurant service, use the following command:

```bash
pnpm test
```

## Docker

To build and run the restaurant service in a Docker container, use the following commands:

1. **Build the Docker image**:
   ```bash
   docker build -t restaurant-service .
   ```

2. **Run the Docker container**:
   ```bash
   docker run -p 3000:3000 restaurant-service
   ```

## License

This project is licensed under the MIT License. See the LICENSE file for details.