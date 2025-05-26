import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Restaurant {
    id: ID!
    name: String!
    description: String
    isOnline: Boolean!
    menuItems: [MenuItem!]!
    orders: [Order!]!
    createdAt: String!
    updatedAt: String!
  }

  type MenuItem {
    id: ID!
    name: String!
    description: String
    price: Float!
    restaurantId: String!
    restaurant: Restaurant!
    createdAt: String!
    updatedAt: String!
  }

  type Order {
    id: ID!
    status: OrderStatus!
    items: [OrderItem!]!
    total: Float!
    restaurantId: String!
    restaurant: Restaurant!
    deliveryAgentId: String
    rejectionReason: String
    createdAt: String!
    updatedAt: String!
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

  input CreateMenuItemInput {
    name: String!
    description: String
    price: Float!
    restaurantId: String!
  }

  input UpdateMenuItemInput {
    name: String
    description: String
    price: Float
  }

  input UpdateOrderStatusInput {
    orderId: String!
    status: OrderStatus!
    rejectionReason: String
  }
  type Query {
    restaurant(id: ID!): Restaurant
    restaurants: [Restaurant!]!
    menuItem(id: ID!): MenuItem
    menuItems(restaurantId: ID!): [MenuItem!]!
    order(id: ID!): Order
    restaurantOrders(restaurantId: ID!): [Order!]!
    pendingOrders: [Order!]!
  }
  input UpdateRestaurantInput {
    name: String
    description: String
    isOnline: Boolean
  }  type Mutation {
    createMenuItem(input: CreateMenuItemInput!): MenuItem!
    updateMenuItem(id: ID!, input: UpdateMenuItemInput!): MenuItem!
    deleteMenuItem(id: ID!): MenuItem!
    updateOrderStatus(input: UpdateOrderStatusInput!): Order!
    toggleRestaurantAvailability(id: ID!): Restaurant!
    updateRestaurant(id: ID!, input: UpdateRestaurantInput!): Restaurant!
    acceptOrder(orderId: ID!): Order!
    rejectOrder(orderId: ID!, reason: String!): Order!
  }
`; 