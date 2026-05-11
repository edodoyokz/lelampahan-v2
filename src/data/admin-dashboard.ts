import { OrderStatus, ReviewStatus } from '@prisma/client';
import { prisma } from '@/db/prisma';

export async function getAdminDashboardStats() {
  const [
    totalPartners,
    pendingPartners,
    approvedPartners,
    rejectedPartners,
    totalListings,
    pendingListings,
    publishedListings,
    rejectedListings,
    totalOrders,
    pendingPaymentOrders,
    paidOrders,
    completedOrders,
    revenueAggregate,
  ] = await Promise.all([
    prisma.partner.count(),
    prisma.partner.count({ where: { status: ReviewStatus.PENDING_REVIEW } }),
    prisma.partner.count({ where: { status: ReviewStatus.APPROVED } }),
    prisma.partner.count({ where: { status: ReviewStatus.REJECTED } }),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: ReviewStatus.PENDING_REVIEW } }),
    prisma.listing.count({ where: { status: ReviewStatus.PUBLISHED } }),
    prisma.listing.count({ where: { status: ReviewStatus.REJECTED } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: OrderStatus.PENDING_PAYMENT } }),
    prisma.order.count({ where: { status: OrderStatus.PAID } }),
    prisma.order.count({ where: { status: OrderStatus.COMPLETED } }),
    prisma.order.aggregate({
      where: { status: { in: [OrderStatus.PAID, OrderStatus.COMPLETED] } },
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    partners: {
      total: totalPartners,
      pendingReview: pendingPartners,
      approved: approvedPartners,
      rejected: rejectedPartners,
    },
    listings: {
      total: totalListings,
      pendingReview: pendingListings,
      published: publishedListings,
      rejected: rejectedListings,
    },
    orders: {
      total: totalOrders,
      pendingPayment: pendingPaymentOrders,
      paid: paidOrders,
      completed: completedOrders,
      revenue: revenueAggregate._sum.totalAmount ?? 0,
    },
  };
}
