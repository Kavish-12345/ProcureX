import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import logger from '../lib/logger.js';
import type { MarkPaidInput } from '../schemas/ledger.schema.js';

// Retailer :  see what they owe to each supplier
export async function getMyDues(req: Request, res: Response) {
    try {
        const retailerId = req.user!.userId;

        const entries = await prisma.ledgerEntry.findMany({
            where: {
                order: { retailerId },
            },
            include: {
                order: {
                    select: {
                        id: true,
                        totalAmount: true,
                        createdAt: true,
                        supplier: {
                            select: { id: true, name: true, businessName: true },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return res.status(200).json({ entries });
    } catch (error) {
        logger.error('Get dues error:', error);
        return res.status(500).json({ message: 'Something went wrong while fetching dues' });
    }
}

// Supplier : see what each retailer owes them
export async function getMyReceivables(req: Request, res: Response) {
    try {
        const supplierId = req.user!.userId;

        const entries = await prisma.ledgerEntry.findMany({
            where: {
                order: { supplierId },
            },
            include: {
                order: {
                    select: {
                        id: true,
                        totalAmount: true,
                        createdAt: true,
                        retailer: {
                            select: { id: true, name: true, businessName: true },
                        },
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json({ entries });
    } catch (error) {
        logger.error('Get receivables error:', error);
        return res.status(500).json({ message: 'Something went wrong while fetching receivables' });
    }
}

// Supplier : mark a ledger entry as paid
export async function markAsPaid(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const supplierId = req.user!.userId;
        const data = req.body as MarkPaidInput;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: 'Invalid ledger entry id' });
        }

        const entry = await prisma.ledgerEntry.findUnique({
            where: { id },
            include: {
                order: true,
            },
        });

        if (!entry) {
            return res.status(404).json({
                message: 'Ledger entry not found'
            });
        }

        // Only the supplier on this order can mark it as paid
        if (entry.order.supplierId !== supplierId) {
            return res.status(403).json({ message: 'You are not authorized to update this entry' });
        }

        if (entry.isPaid) {
            return res.status(409).json({ message: 'This entry is already marked as paid' });
        }

        const updatedEntry = await prisma.ledgerEntry.update({
            where: { id },
            data: {
                isPaid: true,
                paidAt: data.paidAt ?? new Date(),
            },
        });

        return res.status(200).json({
            message: 'Ledger entry marked as paid',
            entry: updatedEntry,
        });
    } catch (error) {
        logger.error('Mark as paid error:', error);
        return res.status(500).json({ message: 'Something went wrong while updating ledger entry' });
    }
}