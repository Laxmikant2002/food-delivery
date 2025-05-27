import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types/express';

const prisma = new PrismaClient();

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const deliveryAgentId = req.user?.id;

    // Verify the order belongs to this delivery agent
    const order = await prisma.order.findUnique({
      where: { 
        id,
        deliveryAgentId
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found or not assigned to this delivery agent' });
    }

    // Validate status transition
    const validTransitions: { [key: string]: string[] } = {
      'PENDING': ['PICKED_UP', 'CANCELLED'],
      'PICKED_UP': ['IN_TRANSIT', 'CANCELLED'],
      'IN_TRANSIT': ['DELIVERED', 'CANCELLED'],
      'DELIVERED': [],
      'CANCELLED': []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status transition from ${order.status} to ${status}`
      });
    }

    // Update status and relevant timestamps
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'PICKED_UP') {
      updateData.pickupTime = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredTime = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        deliveryAgent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
};