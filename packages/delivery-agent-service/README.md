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

## API Testing with Postman

### Prerequisites
1. Install [Postman](https://www.postman.com/downloads/)
2. Have the service running locally (`pnpm dev`)
3. PostgreSQL database running

### Postman Collection

Import the following requests into Postman to test the API endpoints:

#### 1. Authentication
```json
{
  "name": "Delivery Agent - Authentication",
  "item": [
    {
      "name": "Create Delivery Agent",
      "request": {
        "method": "POST",
        "url": "http://localhost:4002/graphql",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": {
            "query": "mutation CreateDeliveryAgent($input: CreateDeliveryAgentInput!) { createDeliveryAgent(input: $input) { id name isAvailable } }",
            "variables": {
              "input": {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "password": "password123"
              }
            }
          }
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:4002/graphql",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": {
            "query": "mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) { token agent { id name isAvailable } } }",
            "variables": {
              "email": "john.doe@example.com",
              "password": "password123"
            }
          }
        }
      }
    }
  ]
}
```

#### 2. Order Management
```json
{
  "name": "Delivery Agent - Order Management",
  "item": [
    {
      "name": "Available Orders",
      "request": {
        "method": "POST",
        "url": "http://localhost:4002/graphql",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": {
            "query": "query { availableOrders { id status pickupAddress deliveryAddress } }"
          }
        }
      }
    },
    {
      "name": "Order History",
      "request": {
        "method": "POST",
        "url": "http://localhost:4002/graphql",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": {
            "query": "query { orderHistory { id status deliveryAddress deliveredAt } }"
          }
        }
      }
    },
    {
      "name": "Current Order",
      "request": {
        "method": "POST",
        "url": "http://localhost:4002/graphql",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": {
            "query": "query { currentOrder { id status pickupAddress deliveryAddress } }"
          }
        }
      }
    }
  ]
}
```

#### 3. Delivery Status Management
```json
{
  "name": "Delivery Agent - Status Management",
  "item": [
    {
      "name": "Update Availability",
      "request": {
        "method": "POST",
        "url": "http://localhost:4002/graphql",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": {
            "query": "mutation UpdateAvailability($isAvailable: Boolean!) { updateAvailability(isAvailable: $isAvailable) { id name isAvailable } }",
            "variables": {
              "isAvailable": true
            }
          }
        }
      }
    },
    {
      "name": "Update Location",
      "request": {
        "method": "POST",
        "url": "http://localhost:4002/graphql",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": {
            "query": "mutation UpdateLocation($input: LocationInput!) { updateLocation(input: $input) { id } }",
            "variables": {
              "input": {
                "latitude": 40.7128,
                "longitude": -74.0060
              }
            }
          }
        }
      }
    }
  ]
}
```

#### 4. Delivery Process
```json
{
  "name": "Delivery Agent - Delivery Process",
  "item": [
    {
      "name": "Start Delivery",
      "request": {
        "method": "POST",
        "url": "http://localhost:4002/graphql",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": {
            "query": "mutation StartDelivery($orderId: ID!) { startDelivery(orderId: $orderId) { id status } }",
            "variables": {
              "orderId": "ORDER_ID"
            }
          }
        }
      }
    },
    {
      "name": "Complete Delivery",
      "request": {
        "method": "POST",
        "url": "http://localhost:4002/graphql",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": {
            "query": "mutation CompleteDelivery($orderId: ID!) { completeDelivery(orderId: $orderId) { id status deliveredAt } }",
            "variables": {
              "orderId": "ORDER_ID"
            }
          }
        }
      }
    }
  ]
}
```

#### 5. Admin Operations
```json
{
  "name": "Delivery Agent - Admin Operations",
  "item": [
    {
      "name": "List All Agents",
      "request": {
        "method": "POST",
        "url": "http://localhost:4002/graphql",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": {
            "query": "query { deliveryAgents { id name isAvailable } }"
          }
        }
      }
    },
    {
      "name": "Get Available Agents",
      "request": {
        "method": "POST",
        "url": "http://localhost:4002/graphql",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": {
            "query": "query { availableDeliveryAgents { id name isAvailable } }"
          }
        }
      }
    }
  ]
}
```

### Testing Flow

1. **Authentication Flow**:
   - Create a delivery agent account
   - Login to get authentication token
   - Set the token in Postman environment variables

2. **Order Management Flow**:
   - Check available orders
   - Start a delivery
   - Check current order
   - Complete delivery
   - Verify order history

3. **Status Management Flow**:
   - Update availability status
   - Update location
   - Verify status changes

4. **Admin Operations Flow**:
   - List all agents
   - Check available agents
   - Update agent details

### Setting Up Environment Variables

1. In Postman, create a new environment
2. Add the following variables:
   - `token`: (empty initially, will be filled after login)
   - `baseUrl`: http://localhost:4002/graphql

### Error Testing

Test these scenarios to ensure proper error handling:

1. Authentication errors:
   - Invalid credentials
   - Missing token
   - Expired token

2. Order management errors:
   - Invalid order ID
   - Already assigned orders
   - Completed orders

3. Status update errors:
   - Invalid location data
   - Unavailable while having active orders

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test
```