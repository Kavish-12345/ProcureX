import prisma from './prisma.js';

type NotificationType =
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'CONNECTION_CREATED'
  | 'PAYMENT_RECORDED';

// Callers inside a `$transaction` must pass their `tx` so the notification is
// written as part of that transaction — otherwise a rolled-back order would
// still leave someone notified about it. Typed as "anything exposing the
// notification delegate", which both the client and a `tx` satisfy, avoiding a
// dependency on Prisma's namespace types.
type DbClient = Pick<typeof prisma, 'notification'>;

interface NotificationInput {
  userId: string;
  type: NotificationType;
  message: string;
  orderId?: string;
}

export async function createNotification(client: DbClient, input: NotificationInput) {
  return client.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      message: input.message,
      orderId: input.orderId,
    },
  });
}
