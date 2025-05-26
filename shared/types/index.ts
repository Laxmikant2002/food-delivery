export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  IN_DELIVERY = 'IN_DELIVERY',
  DELIVERED = 'DELIVERED'
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Restaurant {
  id: string;
  name: string;
  isOnline: boolean;
  availabilityStart: Date;
  availabilityEnd: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  restaurantId: string;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  deliveryAgentId?: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
}

export interface Rating {
  id: string;
  orderId: string;
  userId: string;
  restaurantRating: number;
  deliveryAgentRating?: number;
}

export interface DeliveryAgent {
  id: string;
  name: string;
  isAvailable: boolean;
} 