# Delivery Agent Service

This is the delivery agent service of the food delivery application. It is responsible for managing delivery agents, including their registration, assignment to orders, and tracking their status.

## Getting Started

To get started with the delivery agent service, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd food-delivery-monorepo/packages/delivery-agent-service
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

The delivery agent service exposes the following API endpoints:

- **GET /delivery-agents**: Retrieve a list of all delivery agents.
- **POST /delivery-agents**: Register a new delivery agent.
- **GET /delivery-agents/:id**: Retrieve details of a specific delivery agent.
- **PUT /delivery-agents/:id**: Update a delivery agent's information.
- **DELETE /delivery-agents/:id**: Remove a delivery agent from the system.

## Testing

To run the tests for the delivery agent service, use the following command:

```bash
pnpm test
```

## Docker

To build and run the delivery agent service in a Docker container, use the following commands:

1. **Build the Docker image**:
   ```bash
   docker build -t delivery-agent-service .
   ```

2. **Run the Docker container**:
   ```bash
   docker run -p 3000:3000 delivery-agent-service
   ```

## License

This project is licensed under the MIT License. See the LICENSE file for details.