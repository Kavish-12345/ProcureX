import type { Request , Response } from "express";
import prisma from "../lib/prisma.js";
import type { CreateOrderInput , UpdateOrderStatusInput } from "../schemas/order.schema.js";
import { create } from "node:domain";

export async function createOrder(req: Request , res: Response){
    try{
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
        for( const item of data.items){
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
        
        // Decrement of stock 
        for(const item of data.items){
            await tx.product.update({
                where: { id: item.productId},
                data: {
                    stock: {
                        decrement: item.quantity
                    }
                },
            })
        }

        // Calculate total order amount
        let totalAmount = 0 ; 
        const orderItemsData = data.items.map((item) => {
            const product = products.find((p) => p.id === data.supplierId)!; 
            const itemTotal = Number(product.unitPrice) * item.quantity;
            totalAmount += itemTotal; 

            return{
                productId: item.productId, 
                quantity: item.quantity,
                priceAtOrder: product.unitPrice,
            }
        }); 

        const newOrder = await tx.order.create({
           data:{
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

