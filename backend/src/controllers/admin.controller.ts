import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import logger from '../lib/logger.js';
import type { SetUserActiveInput } from '../schemas/admin.schema.js';

// Never includes `password` — this is the only place in the app that returns
// other people's user records, so the select list is the safeguard.
const ADMIN_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  businessName: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

const USER_ROLES = ['RETAILER', 'SUPPLIER', 'ADMIN'] as const;
const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export async function getAllUsers(req: Request, res: Response) {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const search = (req.query.search as string)?.trim();
    const role = req.query.role as string | undefined;
    const isActive = req.query.isActive as string | undefined;

    const where = {
      ...(role && USER_ROLES.includes(role as (typeof USER_ROLES)[number])
        ? { role: role as (typeof USER_ROLES)[number] }
        : {}),
      // Only filter when explicitly 'true'/'false'; absent means "either".
      ...(isActive === 'true' || isActive === 'false'
        ? { isActive: isActive === 'true' }
        : {}),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { businessName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: ADMIN_USER_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('Admin get all users error:', error);
    return res.status(500).json({ message: 'Something went wrong while fetching users' });
  }
}

export async function getAllOrders(req: Request, res: Response) {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const status = req.query.status as string | undefined;
    const search = (req.query.search as string)?.trim();

    const where = {
      // Validated against the real enum rather than blindly cast — an unknown
      // value is ignored instead of being handed to Prisma.
      ...(status && ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])
        ? { status: status as (typeof ORDER_STATUSES)[number] }
        : {}),
      // Orders have no searchable text of their own, so search matches either
      // party's business name through the relation.
      ...(search && {
        OR: [
          { retailer: { businessName: { contains: search, mode: 'insensitive' as const } } },
          { supplier: { businessName: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          retailer: { select: { id: true, name: true, businessName: true } },
          supplier: { select: { id: true, name: true, businessName: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return res.status(200).json({
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('Admin get all orders error:', error);
    return res.status(500).json({ message: 'Something went wrong while fetching orders' });
  }
}

export async function getPlatformStats(_req: Request, res: Response) {
  try {
    // One round trip for all of it — these are only ever read together.
    const [totalUsers, retailers, suppliers, totalOrders, pendingOrders, unpaidLedger] =
      await prisma.$transaction([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'RETAILER' } }),
        prisma.user.count({ where: { role: 'SUPPLIER' } }),
        prisma.order.count(),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.ledgerEntry.aggregate({
          where: { isPaid: false },
          _count: true,
          _sum: { amount: true },
        }),
      ]);

    return res.status(200).json({
      stats: {
        totalUsers,
        retailers,
        suppliers,
        totalOrders,
        pendingOrders,
        unpaidEntries: unpaidLedger._count,
        outstandingAmount: unpaidLedger._sum.amount ?? 0,
      },
    });
  } catch (error) {
    logger.error('Admin get platform stats error:', error);
    return res.status(500).json({ message: 'Something went wrong while fetching stats' });
  }
}

export async function setUserActive(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const { isActive } = req.body as SetUserActiveInput;

    // Without this, an admin can suspend themselves — and since reactivating
    // requires an admin, that locks everyone out of the panel permanently.
    if (id === req.user!.userId) {
      return res.status(400).json({ message: 'You cannot change your own account status' });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: ADMIN_USER_SELECT,
    });

    return res.status(200).json({
      message: isActive ? 'Account reactivated' : 'Account suspended',
      user,
    });
  } catch (error) {
    logger.error('Admin set user active error:', error);
    return res.status(500).json({ message: 'Something went wrong while updating the account' });
  }
}
