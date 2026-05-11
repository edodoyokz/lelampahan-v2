import { OrderStatus, ReviewStatus } from '@prisma/client';
import { prisma } from '@/db/prisma';

export async function getPartnerDashboardStats(input: { partnerId: string; role: string }) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const partnerWhere = { partnerId: input.partnerId };
  const orderWhere = { session: { listing: { partnerId: input.partnerId } } };

  const [
    partner,
    totalListings,
    draftListings,
    pendingListings,
    publishedListings,
    rejectedListings,
    pendingPaymentBookings,
    approvedBookings,
    completedBookings,
    monthOrders,
    monthRevenue,
  ] = await Promise.all([
    prisma.partner.findUnique({ where: { id: input.partnerId } }),
    prisma.listing.count({ where: partnerWhere }),
    prisma.listing.count({ where: { ...partnerWhere, status: ReviewStatus.DRAFT } }),
    prisma.listing.count({ where: { ...partnerWhere, status: ReviewStatus.PENDING_REVIEW } }),
    prisma.listing.count({ where: { ...partnerWhere, status: ReviewStatus.PUBLISHED } }),
    prisma.listing.count({ where: { ...partnerWhere, status: ReviewStatus.REJECTED } }),
    prisma.order.count({ where: { ...orderWhere, status: OrderStatus.PENDING_PAYMENT } }),
    prisma.order.count({ where: { ...orderWhere, status: OrderStatus.PAID } }),
    prisma.order.count({ where: { ...orderWhere, status: OrderStatus.COMPLETED } }),
    prisma.order.count({ where: { ...orderWhere, createdAt: { gte: monthStart } } }),
    prisma.order.aggregate({
      where: {
        ...orderWhere,
        createdAt: { gte: monthStart },
        status: { in: [OrderStatus.PAID, OrderStatus.COMPLETED] },
      },
      _sum: { totalAmount: true },
    }),
  ]);

  if (!partner) throw new Error('Partner not found');

  const monthGross = monthRevenue._sum.totalAmount ?? 0;

  return {
    partner: { id: partner.id, name: partner.name, status: partner.status, role: input.role },
    listings: {
      total: totalListings,
      draft: draftListings,
      pendingReview: pendingListings,
      published: publishedListings,
      rejected: rejectedListings,
    },
    bookings: {
      requested: 0,
      pendingPayment: pendingPaymentBookings,
      approved: approvedBookings,
      completed: completedBookings,
      monthCount: monthOrders,
    },
    revenue: {
      monthGross,
      estimatedPayout: monthGross,
    },
  };
}
