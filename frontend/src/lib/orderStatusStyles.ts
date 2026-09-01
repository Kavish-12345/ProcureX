import type { Order } from '@/types'

export const orderStatusTone: Record<Order['status'], 'neutral' | 'active' | 'muted' | 'filled' | 'strikethrough'> = {
  PENDING: 'neutral',
  CONFIRMED: 'active',
  SHIPPED: 'muted',
  DELIVERED: 'filled',
  CANCELLED: 'strikethrough',
}

export const OPEN_ORDER_STATUSES: Order['status'][] = ['PENDING', 'CONFIRMED', 'SHIPPED']
