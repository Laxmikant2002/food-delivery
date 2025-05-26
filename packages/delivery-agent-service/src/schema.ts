import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar DateTime

  type DeliveryAgent {
    id: ID!
    name: String!
    isAvailable: Boolean!
    currentOrder: Order
    orders: [Order!]!
  }

  type Order {
    id: ID!
    userId: ID!
    restaurant: Restaurant!
    deliveryAgent: DeliveryAgent!
    status: OrderStatus!
    totalAmount: Float!
    createdAt: DateTime!
    orderItems: [OrderItem!]!
    deliveryLocation: Location!
  }

  type Restaurant {
    id: ID!
    name: String!
    location: Location!
  }

  type OrderItem {
    id: ID!
    menuItem: MenuItem!
    quantity: Int!
  }

  type MenuItem {
    id: ID!
    name: String!
    price: Float!
  }

  type Location {
    latitude: Float!
    longitude: Float!
    address: String!
  }

  enum OrderStatus {
    PENDING
    ACCEPTED
    REJECTED
    IN_DELIVERY
    DELIVERED
  }

  input UpdateLocationInput {
    latitude: Float!
    longitude: Float!
  }

  type Query {
    me: DeliveryAgent! @auth
    currentOrder: Order @auth
    orderHistory: [Order!]! @auth
    availableOrders: [Order!]! @auth
  }

  type Mutation {
    updateAvailability(isAvailable: Boolean!): DeliveryAgent! @auth
    updateLocation(input: UpdateLocationInput!): DeliveryAgent! @auth
    startDelivery(orderId: ID!): Order! @auth
    completeDelivery(orderId: ID!): Order! @auth
  }

  directive @auth on FIELD_DEFINITION
`; 