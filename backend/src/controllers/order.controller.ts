import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import type { CreateOrderInput, UpdateOrderStatusInput } from "../schemas/order.schema.js";
import { create } from "node:domain";

export async function createOrder(req: Request, res: Response) {
  try {
    const data = req.body as CreateOrderInput;
    const retailerId = req.user!.userId;

    // ACID guarantee - no partial state.
    const order = await prisma.$transaction(async (tx) => {
      // The classic example of how to solve the N+1 query problem. 
      // Fetch all products being ordered, locking in their current price + stock
      const productIds = data.items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: {
          id: {
            in: productIds
          }
        },
      });

      // Validating every product exists 
      for (const item of data.items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.supplierId !== data.supplierId) {
          throw new Error(`Product ${item.productId} does not belong to the specified supplier`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product "${product.name}"`);
        }
      }

      // Calculate total order amount
      let totalAmount = 0;
      const orderItemsData = data.items.map((item) => {
        const product = products.find((p) => p.id === data.supplierId)!;
        const itemTotal = Number(product.unitPrice) * item.quantity;
        totalAmount += itemTotal;

        return {
          productId: item.productId,
          quantity: item.quantity,
          priceAtOrder: product.unitPrice,
        }
      });

      const newOrder = await tx.order.create({
        data: {
          retailerId,
          supplierId: data.supplierId,
          totalAmount,
          items: {
            create: orderItemsData,
          },
          include: {
            items: { include: { product: true } },
          },
        }
      });

      return newOrder;
    });


    return res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    const message = error instanceof Error ? error.message : 'Something went wrong while placing the order';
    return res.status(400).json({ message });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body as UpdateOrderStatusInput;
    const userId = req.user!.userId;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const order = await prisma.$transaction(async (tx) => {
      const existingOrder = await prisma.order.findUnique({
        where: { id },
      });

      if (!existingOrder) {
        throw new Error('Order not found');
      }

      if (existingOrder.supplierId !== userId) {
        throw new Error('You are not authorized to update this order');
      }

      // State machine
      const validTransitions: Record<string, string[]> = {
        PENDING: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['SHIPPED', 'CANCELLED'],
        SHIPPED: ['DELIVERED'],
        DELIVERED: [],
        CANCELLED: [],
      };

      const allowedNextStatuses = validTransitions[existingOrder.status] ?? [];
      if (!allowedNextStatuses.includes(data.status)) {
        throw new Error(
          `Cannot move order from ${existingOrder.status} to ${data.status}`
        );
      }

      const updatedOrder = await tx.order.update({
        where: {
          id
        },
        data: { status: data.status },
      });

      // If the status updates to confirmed.
      if (data.status === 'CONFIRMED') {
        if (!data.dueDate) {
          throw new Error('Due date is required when confirming an order');
        }

        const items = await tx.orderItem.findMany({ where: { orderId: id } });

        for (const item of items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });

          if (!product || product.stock < item.quantity) {
            throw new Error('Insufficient stock to confirm this order');
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        await tx.ledgerEntry.create({
          data: {
            orderId: id,
            amount: existingOrder.totalAmount,
            dueDate: data.dueDate,
          },
        });
      }


      if (data.status === 'CANCELLED' && existingOrder.status !== 'PENDING') {
        const items = await tx.orderItem.findMany({ where: { orderId: id } });
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      if (data.status === 'DELIVERED') {
        const existingConnection = await tx.supplierRetailerConnection.findUnique({
          where: {
            supplierId_retailerId: {
              supplierId: existingOrder.supplierId,
              retailerId: existingOrder.retailerId,
            }
          }
        });

        if (!existingConnection) {
          await tx.supplierRetailerConnection.create({
            data: {
              supplierId: existingOrder.supplierId,
              retailerId: existingOrder.retailerId,
            },
          });
        }
      }

      return updatedOrder;
    });
    return res.status(200).json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    const message = error instanceof Error ? error.message : 'Something went wrong while updating order status';
    return res.status(400).json({ message });
  }
}

export async function getMyOrdersAsRetailer(req: Request, res: Response) {
  try {
    const retailerId = req.user!.userId;
    const orders = await prisma.order.findMany({
      where: { retailerId },
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: {
          select: {
            id: true, name: true, businessName: true
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true, name: true, unit: true
              }
            }
          }
        },
        ledgerEntry: {
          select: { amount: true, dueDate: true, isPaid: true, paidAt: true },
        },
      }
    });
    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Get retailer orders error:', error);
    return res.status(500).json({ message: 'Something went wrong while fetching orders' });
  }
}

export async function getMyOrdersAsSupplier(req: Request, res: Response) {
  try {
    const supplierId = req.user!.userId;
    const orders = await prisma.order.findMany({
      where: { supplierId },
      orderBy: { createdAt: 'desc' },
      include: {
        retailer: {
          select: {
            id: true, name: true, businessName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true, name: true, unit: true
              }
            }
          }
        },
        ledgerEntry: {
          select: { amount: true, dueDate: true, isPaid: true, paidAt: true },
        },
      }
    });
    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Get supplier orders error:', error);
    return res.status(500).json({ message: 'Something went wrong while fetching orders' });
  }
}

export async function getOrderById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid order id' });
    }


    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        retailer: {
          select: {
            id: true, name: true, businessName: true
          }
        },
        supplier: {
          select: {
            id: true, name: true, businessName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true, name: true, unit: true, unitPrice: true
              }
            }
          }
        },
        ledgerEntry: true,
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the retailer or supplier on this order can view it
    if (order.retailerId !== userId && order.supplierId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to view this order' });
    }
    return res.status(200).json({ order });
  } catch (error) {
    console.error('Get order by id error:', error);
    return res.status(500).json({ message: 'Something went wrong while fetching the order' });
  }
}
