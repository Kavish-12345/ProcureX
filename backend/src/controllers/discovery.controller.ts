import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import logger from '../lib/logger.js';

export async function browseSuppliers(req: Request, res: Response) {
    try {
        const { search } = req.query;

        const suppliers = await prisma.user.findMany({
            where: {
                role: 'SUPPLIER',
                ...(search && typeof search === 'string'
                    ? {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { businessName: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : {}),
            },
            select: {
                id: true,
                name: true,
                businessName: true,
                phone: true,
                createdAt: true,
            },
            orderBy: { businessName: 'asc' },
        });

        return res.status(200).json({ suppliers });
    } catch (error) {
        logger.error('Browse suppliers error:', error);
        return res.status(500).json({ message: 'Something went wrong while fetching suppliers' });
    }
}
