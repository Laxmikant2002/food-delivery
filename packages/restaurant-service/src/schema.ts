import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar DateTime

  type Restaurant {
    id: ID!
    name: String!
    isOnline: Boolean!
    availabilityStart: DateTime!
    availabilityEnd: DateTime!
    menuItems: [MenuItem!]!
    orders: [Order!]!
  }

  type MenuItem {
    id: ID!
    name: String!
    description: String
    price: Float!
    restaurant: Restaurant!
  }

  type Order {
    id: ID!
    userId: ID!
    restaurant: Restaurant!
    deliveryAgent: DeliveryAgent
    status: OrderStatus!
    totalAmount: Float!
    createdAt: DateTime!
    orderItems: [OrderItem!]!
  }

  type OrderItem {
    id: ID!
    menuItem: MenuItem!
    quantity: Int!
  }

  type DeliveryAgent {
    id: ID!
    name: String!
    isAvailable: Boolean!
    orders: [Order!]!
  }

  enum OrderStatus {
    PENDING
    ACCEPTED
    REJECTED
    IN_DELIVERY
    DELIVERED
  }

  input UpdateRestaurantInput {
    name: String
    isOnline: Boolean
    availabilityStart: DateTime
    availabilityEnd: DateTime
  }

  input CreateMenuItemInput {
    name: String!
    description: String
    price: Float!
  }

  input UpdateMenuItemInput {
    name: String
    description: String
    price: Float
  }

  type Query {
    restaurant(id: ID!): Restaurant! @auth
    restaurantOrders(status: OrderStatus): [Order!]! @auth
    menuItems: [MenuItem!]! @auth
    pendingOrders: [Order!]! @auth
  }

  type Mutation {
    updateRestaurant(input: UpdateRestaurantInput!): Restaurant! @auth
    createMenuItem(input: CreateMenuItemInput!): MenuItem! @auth
    updateMenuItem(id: ID!, input: UpdateMenuItemInput!): MenuItem! @auth
    deleteMenuItem(id: ID!): Boolean! @auth
    acceptOrder(orderId: ID!): Order! @auth
    rejectOrder(orderId: ID!, reason: String!): Order! @auth
  }

  directive @auth on FIELD_DEFINITION
`; 