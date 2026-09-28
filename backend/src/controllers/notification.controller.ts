import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import logger from '../lib/logger.js';

export async function getMyNotifications(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return res.status(200).json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    return res.status(500).json({ message: 'Something went wrong while fetching notifications' });
  }
}

export async function getUnreadCount(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return res.status(200).json({ count });
  } catch (error) {
    logger.error('Get unread notification count error:', error);
    return res.status(500).json({ message: 'Something went wrong while fetching the unread count' });
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid notification id' });
    }

    const userId = req.user!.userId;
    const notification = await prisma.notification.findUnique({ where: { id } });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ message: 'This notification does not belong to you' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.status(200).json({
      message: 'Notification marked as read',
      notification: updated,
    });
  } catch (error) {
    logger.error('Mark notification as read error:', error);
    return res.status(500).json({ message: 'Something went wrong while updating the notification' });
  }
}

export async function markAllAsRead(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const { count } = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return res.status(200).json({
      message: 'All notifications marked as read',
      count,
    });
  } catch (error) {
    logger.error('Mark all notifications as read error:', error);
    return res.status(500).json({ message: 'Something went wrong while updating notifications' });
  }
}
