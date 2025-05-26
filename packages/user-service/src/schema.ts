// GraphQL schema for User Service
import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar DateTime

  type User {
    id: ID!
    email: String!
    name: String!
    orders: [Order!]
    ratings: [Rating!]
  }

  type Restaurant {
    id: ID!
    name: String!
    isOnline: Boolean!
    availabilityStart: DateTime!
    availabilityEnd: DateTime!
    menuItems: [MenuItem!]!
  }

  type MenuItem {
    id: ID!
    name: String!
    description: String
    price: Float!
    restaurant: Restaurant!
  }

  type OrderItem {
    id: ID!
    menuItem: MenuItem!
    quantity: Int!
  }

  type Order {
    id: ID!
    user: User!
    restaurant: Restaurant!
    deliveryAgent: DeliveryAgent
    status: OrderStatus!
    totalAmount: Float!
    createdAt: DateTime!
    orderItems: [OrderItem!]!
    ratings: [Rating!]
  }

  type Rating {
    id: ID!
    order: Order!
    user: User!
    restaurantRating: Int!
    deliveryAgentRating: Int
  }

  type DeliveryAgent {
    id: ID!
    name: String!
    isAvailable: Boolean!
    orders: [Order!]
  }

  enum OrderStatus {
    PENDING
    ACCEPTED
    REJECTED
    IN_DELIVERY
    DELIVERED
  }

  input OrderItemInput {
    menuItemId: ID!
    quantity: Int! @constraint(min: 1)
  }

  input PlaceOrderInput {
    restaurantId: ID!
    orderItems: [OrderItemInput!]! @constraint(minItems: 1)
  }

  input RatingInput {
    orderId: ID!
    restaurantRating: Int! @constraint(min: 1, max: 5)
    deliveryAgentRating: Int @constraint(min: 1, max: 5)
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input SignUpInput {
    email: String! @constraint(format: "email")
    password: String! @constraint(minLength: 8)
    name: String! @constraint(minLength: 2)
  }

  input SignInInput {
    email: String! @constraint(format: "email")
    password: String!
  }

  type Query {
    me: User! @auth
    availableRestaurants: [Restaurant!]!
    restaurant(id: ID!): Restaurant
    order(id: ID!): Order @auth
    myOrders: [Order!]! @auth
  }

  type Mutation {
    signUp(input: SignUpInput!): AuthPayload!
    signIn(input: SignInInput!): AuthPayload!
    placeOrder(input: PlaceOrderInput!): Order! @auth
    submitRating(input: RatingInput!): Rating! @auth
  }

  directive @constraint(
    min: Int
    max: Int
    format: String
    minLength: Int
    maxLength: Int
    pattern: String
    minItems: Int
    maxItems: Int
  ) on FIELD_DEFINITION | INPUT_FIELD_DEFINITION

  directive @auth on FIELD_DEFINITION
`;
