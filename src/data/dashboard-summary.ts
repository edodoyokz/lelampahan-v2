import { OrderStatus, ReviewStatus, TicketStatus } from '@prisma/client';
import { prisma } from '@/db/prisma';

export async function getCustomerDashboardSummary(userProfileId: string) {
  const [totalOrders, activeTickets, pendingPaymentOrders] = await Promise.all([
    prisma.order.count({ where: { userId: userProfileId } }),
    prisma.ticket.count({
      where: { status: TicketStatus.ISSUED, order: { userId: userProfileId } },
    }),
    prisma.order.count({
      where: { userId: userProfileId, status: OrderStatus.PENDING_PAYMENT },
    }),
  ]);

  return { totalOrders, activeTickets, pendingPaymentOrders };
}

function monthRange(now: Date) {
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
  };
}

export async function getPartnerDashboardSummary(partnerId: string, now = new Date()) {
  const { start, end } = monthRange(now);
  const partnerOrderWhere = { session: { listing: { partnerId } } };
  const monthlyPaidWhere = {
    ...partnerOrderWhere,
    status: { in: [OrderStatus.PAID, OrderStatus.COMPLETED] },
    createdAt: { gte: start, lt: end },
  };

  const [
    activeListings,
    draftReviewListings,
    requestedBookings,
    pendingPaymentBookings,
    monthlyPaidOrders,
    monthlyRevenue,
  ] = await Promise.all([
    prisma.listing.count({ where: { partnerId, status: ReviewStatus.PUBLISHED } }),
    prisma.listing.count({
      where: { partnerId, status: { in: [ReviewStatus.DRAFT, ReviewStatus.PENDING_REVIEW] } },
    }),
    prisma.order.count({ where: { ...partnerOrderWhere, status: 'REQUESTED' as OrderStatus } }),
    prisma.order.count({ where: { ...partnerOrderWhere, status: OrderStatus.PENDING_PAYMENT } }),
    prisma.order.count({ where: monthlyPaidWhere }),
    prisma.order.aggregate({ where: monthlyPaidWhere, _sum: { totalAmount: true } }),
  ]);

  return {
    activeListings,
    draftReviewListings,
    requestedBookings,
    pendingPaymentBookings,
    monthlyPaidOrders,
    estimatedMonthlyRevenue: monthlyRevenue._sum.totalAmount ?? 0,
  };
}

export async function getAdminDashboardSummary() {
  const [totalPartners, totalListings, pendingPartnerReviews, pendingListingReviews, revenue] =
    await Promise.all([
      prisma.partner.count({ where: { archivedAt: null } }),
      prisma.listing.count({ where: { archivedAt: null } }),
      prisma.partner.count({ where: { status: ReviewStatus.PENDING_REVIEW, archivedAt: null } }),
      prisma.listing.count({ where: { status: ReviewStatus.PENDING_REVIEW, archivedAt: null } }),
      prisma.order.aggregate({
        where: { status: { in: [OrderStatus.PAID, OrderStatus.COMPLETED] } },
        _sum: { totalAmount: true },
      }),
    ]);

  return {
    totalPartners,
    totalListings,
    pendingPartnerReviews,
    pendingListingReviews,
    grossRevenue: revenue._sum.totalAmount ?? 0,
  };
}
