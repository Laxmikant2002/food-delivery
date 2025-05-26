import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type DeliveryAgent {
    id: ID!
    name: String!
    email: String!
    isAvailable: Boolean!
    orders: [Order!]!
  }

  type Order {
    id: ID!
    status: OrderStatus!
    deliveryAgentId: String
    deliveryAgent: DeliveryAgent
    pickupAddress: String!
    deliveryAddress: String!
    deliveredAt: String
    createdAt: String!
    updatedAt: String!
  }

  enum OrderStatus {
    PENDING
    ACCEPTED
    REJECTED
    IN_PREPARATION
    READY_FOR_PICKUP
    IN_DELIVERY
    DELIVERED
    CANCELLED
  }

  input CreateDeliveryAgentInput {
    name: String!
    email: String!
    password: String!
  }

  input UpdateDeliveryAgentInput {
    name: String
    isAvailable: Boolean
  }

  input AssignOrderInput {
    orderId: String!
    deliveryAgentId: String!
  }

  input UpdateOrderStatusInput {
    orderId: String!
    status: OrderStatus!
  }
  input CreateOrderInput {
    pickupAddress: String!
    deliveryAddress: String!
    status: OrderStatus
  }
  type Query {
    me: DeliveryAgent
    currentOrder: Order
    orderHistory: [Order!]!
    availableOrders: [Order!]!
    deliveryAgent(id: ID!): DeliveryAgent
    deliveryAgents: [DeliveryAgent!]!
    availableDeliveryAgents: [DeliveryAgent!]!
    deliveryAgentOrders(deliveryAgentId: ID!): [Order!]!
  }
  input LocationInput {
    latitude: Float!
    longitude: Float!
  }

  type AuthPayload {
    token: String!
    agent: DeliveryAgent!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    updateAvailability(isAvailable: Boolean!): DeliveryAgent!
    updateLocation(input: LocationInput!): DeliveryAgent!
    startDelivery(orderId: ID!): Order!
    completeDelivery(orderId: ID!): Order!
    createDeliveryAgent(input: CreateDeliveryAgentInput!): DeliveryAgent!
    updateDeliveryAgent(id: ID!, input: UpdateDeliveryAgentInput!): DeliveryAgent!
    assignOrder(input: AssignOrderInput!): Order!
    updateOrderStatus(input: UpdateOrderStatusInput!): Order!
    toggleDeliveryAgentAvailability(id: ID!): DeliveryAgent!
    createOrder(input: CreateOrderInput!): Order!
  }
`;