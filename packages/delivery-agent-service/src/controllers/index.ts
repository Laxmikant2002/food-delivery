import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types/express';

const prisma = new PrismaClient();

// Define our own OrderStatus enum to match the schema
enum OrderStatus {
  PENDING = 'PENDING',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

type StatusTransition = {
  [key in OrderStatus]: OrderStatus[];
};

const validStatusTransitions: StatusTransition = {
  [OrderStatus.PENDING]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
  [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: []
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: OrderStatus };
    const deliveryAgentId = req.user?.id;

    // Verify the order belongs to this delivery agent
    const order = await prisma.order.findFirst({
      where: { 
        id,
        deliveryAgentId
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found or not assigned to this delivery agent' });
    }

    // Validate status transition
    const allowedTransitions = validStatusTransitions[order.status as OrderStatus];
    if (!allowedTransitions?.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status transition from ${order.status} to ${status}`
      });
    }

    // Build update data object
    const updateData: any = {
      status,
    };

    if (status === OrderStatus.PICKED_UP) {
      updateData.pickupTime = new Date();
    } else if (status === OrderStatus.DELIVERED) {
      updateData.deliveredTime = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData
    });

    return res.json({
      id: updatedOrder.id,
      status: updatedOrder.status,
      updatedAt: updatedOrder.updatedAt,
      deliveryAgentId: updatedOrder.deliveryAgentId
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
};