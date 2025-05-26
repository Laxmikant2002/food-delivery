import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    orders: [Order!]
    ratings: [Rating!]
    createdAt: String!
    updatedAt: String!
  }

  type Restaurant {
    id: ID!
    name: String!
    isOnline: Boolean!
    availabilityStart: String!
    availabilityEnd: String!
    menuItems: [MenuItem!]!
    orders: [Order!]!
  }

  type MenuItem {
    id: ID!
    name: String!
    description: String
    price: Float!
    restaurant: Restaurant!
    restaurantId: String!
  }

  type Order {
    id: ID!
    userId: String!
    user: User!
    restaurantId: String!
    restaurant: Restaurant!
    status: OrderStatus!
    items: [OrderItem!]!
    total: Float!
    deliveryAddress: String!
    rating: Rating
    createdAt: String!
    updatedAt: String!
    deliveryAgent: DeliveryAgent
  }

  type OrderItem {
    id: ID!
    quantity: Int!
    menuItemId: String!
    menuItem: MenuItem!
    orderId: String!
    order: Order!
    createdAt: String!
    updatedAt: String!
  }

  type Rating {
    id: ID!
    orderId: String!
    order: Order!
    userId: String!
    user: User!
    rating: Int!
    comment: String
    createdAt: String!
    updatedAt: String!
  }

  type DeliveryAgent {
    id: ID!
    name: String!
    isAvailable: Boolean!
    orders: [Order!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input SignUpInput {
    email: String!
    password: String!
    name: String!
  }

  input SignInInput {
    email: String!
    password: String!
  }

  input OrderItemInput {
    menuItemId: String!
    quantity: Int!
  }

  input PlaceOrderInput {
    restaurantId: String!
    items: [OrderItemInput!]!
    deliveryAddress: String!
  }

  input RatingInput {
    orderId: String!
    rating: Int!
    comment: String
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

  type Query {
    me: User
    availableRestaurants: [Restaurant!]!
    restaurant(id: ID!): Restaurant
    order(id: ID!): Order
    myOrders: [Order!]!
  }

  type Mutation {
    signUp(input: SignUpInput!): AuthPayload!
    signIn(input: SignInInput!): AuthPayload!
    placeOrder(input: PlaceOrderInput!): Order!
    submitRating(input: RatingInput!): Rating!
  }
`; 