import type { Request, Response } from "express";
import prisma from '../lib/prisma.js';
import type { CreateConnectionInput } from '../schemas/connection.schema.js';

// Connection creation 
export async function createConnection(req: Request, res: Response) {
    try {
        const retailerId = req.user!.userId;
        const data = req.body as CreateConnectionInput;
        if (retailerId === data.supplierId) {
            return res.status(400).json({ message: 'You cannot connect to yourself' });
        }

        const supplier = await prisma.user.findUnique({
            where: { id: data.supplierId },
        });

        if (!supplier || supplier.role !== 'SUPPLIER') {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        const existingConnection = await prisma.supplierRetailerConnection.findUnique({
            where: {
                supplierId_retailerId: {
                    supplierId: data.supplierId,
                    retailerId,
                },
            },
        });

        if (existingConnection) {
            return res.status(409).json({ message: 'Already connected to this supplier' });
        }

        const connection = await prisma.supplierRetailerConnection.create({
            data: {
                supplierId: data.supplierId,
                retailerId,
            },
        });
        return res.status(201).json({
            message: 'Connected successfully',
            connection,
        });
    } catch (error) {
        console.error('Create connection error:', error);
        return res.status(500).json({ message: 'Something went wrong while creating connection' });
    }
}

export async function getMyConnections(req: Request, res: Response) {
    try {
        const userId = req.user!.userId;
        const role = req.user!.role;

        const connections = await prisma.supplierRetailerConnection.findMany({
            where: role === 'RETAILER' ? { retailerId: userId } : { supplierId: userId },
            include:
                role === 'RETAILER'
                    ? { supplier: { select: { id: true, name: true, businessName: true, phone: true } } }
                    : { retailer: { select: { id: true, name: true, businessName: true, phone: true } } },
            orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json({ connections });
    } catch (error) {
        console.error('Get connections error:', error);
        return res.status(500).json({ message: 'Something went wrong while fetching connections' });
    }
}