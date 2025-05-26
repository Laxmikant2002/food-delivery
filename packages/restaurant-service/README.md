# Restaurant Service

This is the restaurant service of the food delivery application. It is responsible for managing restaurant-related operations, including adding, updating, and retrieving restaurant information.

## Complete Setup and Testing Guide

### Prerequisites
1. **Install Required Software**:
   - Node.js (v18 or later)
   - PNPM (Install using `npm install -g pnpm`)
   - PostgreSQL
   - Postman

### Database Setup
1. **Start PostgreSQL** and ensure it's running
2. **Configure Database**:
   - Create a new database named `food_delivery_restaurant`
   ```powershell
   psql -U postgres
   CREATE DATABASE food_delivery_restaurant;
   ```

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

## Testing with Postman

### Initial Setup
1. **Install Postman**:
   - Download Postman from [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
   - Install and open Postman on your computer

2. **Environment Setup in Postman**:
   - Click "New" -> "Environment"
   - Name it "Restaurant Service Local"
   - Add these variables:
     - `baseUrl`: `http://localhost:4001`
     - `restaurantId`: Leave value empty for now
   - Click "Save"
   - Select the environment from the dropdown in the top-right

### Importing the Collection
1. **Import the Collection**:
   - Open Postman
   - Click on "Import" button at the top left
   - Click "Upload Files"
   - Select the `postman_collection.json` file from the root directory
   - Click "Import"

### Testing the GraphQL Endpoints

Follow these steps in order to test all functionality:

#### 1. Create a Restaurant
1. In Postman, find "Create Restaurant" under "GraphQL Mutations"
2. The request body should already contain:
   ```graphql
   mutation {
     createRestaurant(input: {
       name: "Test Restaurant"
       description: "A test restaurant"
       isOnline: true
     }) {
       id
       name
       description
       isOnline
     }
   }
   ```
3. Click "Send"
4. You should get a response with the created restaurant's details
5. The restaurant ID will be automatically saved to the environment variable

#### 2. Get All Restaurants
1. Find "Get All Restaurants" under "GraphQL Queries"
2. The query should look like:
   ```graphql
   query {
     restaurants {
       id
       name
       description
       isOnline
       menuItems {
         id
         name
         price
       }
     }
   }
   ```
3. Click "Send"
4. You should see a list containing your created restaurant

#### 3. Get Restaurant by ID
1. Find "Get Restaurant by ID" under "GraphQL Queries"
2. The query uses the saved restaurantId variable:
   ```graphql
   query($id: ID!) {
     restaurant(id: $id) {
       id
       name
       description
       isOnline
       menuItems {
         id
         name
         price
       }
     }
   }
   ```
3. Click "Send"
4. You should see your restaurant's details

#### 4. Create a Menu Item
1. Find "Create MenuItem" under "GraphQL Mutations"
2. The mutation should look like:
   ```graphql
   mutation($restaurantId: ID!) {
     createMenuItem(input: {
       name: "Test Item"
       description: "A test menu item"
       price: 9.99
       restaurantId: $restaurantId
     }) {
       id
       name
       description
       price
     }
   }
   ```
3. Click "Send"
4. You should get the created menu item details

#### 5. Update Restaurant
1. Find "Update Restaurant" under "GraphQL Mutations"
2. The mutation should look like:
   ```graphql
   mutation($id: ID!, $input: UpdateRestaurantInput!) {
     updateRestaurant(id: $id, input: $input) {
       id
       name
       description
       isOnline
     }
   }
   ```
3. The variables should be:
   ```json
   {
     "id": "{{restaurantId}}",
     "input": {
       "name": "Updated Restaurant Name",
       "isOnline": false
     }
   }
   ```
4. Click "Send"
5. You should see the updated restaurant details

#### Create a Restaurant
1. Select "Create Restaurant" request
2. Go to the "Body" tab
3. Use this sample JSON:
   ```json
   {
     "name": "Test Restaurant",
     "description": "A test restaurant",
     "isOnline": true
   }
   ```
4. Click "Send"
5. You should get a success response with the created restaurant details

#### Get Restaurant by ID
1. Select "Get Restaurant by ID" request
2. Replace `:id` in the URL with the ID from the created restaurant
3. Click "Send"
4. You should see the restaurant details

#### Update Restaurant
1. Select "Update Restaurant" request
2. Replace `:id` in the URL with your restaurant ID
3. In the "Body" tab, modify the JSON:
   ```json
   {
     "name": "Updated Restaurant Name",
     "isOnline": false
   }
   ```
4. Click "Send"
5. You should see the updated restaurant details

#### Delete Restaurant
1. Select "Delete Restaurant" request
2. Replace `:id` in the URL with your restaurant ID
3. Click "Send"
4. You should get a success response

### Troubleshooting Tips

#### Common Issues and Solutions:
1. **Connection Refused Error**
   - Make sure the service is running (`pnpm dev`)
   - Check if the port 4001 is not in use by another application
   - Verify the baseUrl in Postman environment is correct

2. **GraphQL Validation Errors**
   - Double-check your query syntax
   - Make sure all required fields are included
   - Verify variable names match exactly with the schema

3. **Authentication Errors**
   - Check if the `@auth` directive is applied to the query/mutation
   - Verify your token is properly set in the Headers

4. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Check your DATABASE_URL in .env is correct
   - Verify the database exists and is accessible

#### Quick Fixes:
1. **If the service won't start**:
   ```powershell
   # Kill any process using port 4001
   netstat -ano | findstr :4001
   taskkill /PID <PID> /F
   ```

2. **If database is out of sync**:
   ```powershell
   pnpm prisma:generate
   pnpm prisma:migrate
   ```

3. **To reset everything and start fresh**:
   ```powershell
   pnpm prisma migrate reset
   pnpm dev
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