import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireApiUser: vi.fn(),
  requireApiPartnerContext: vi.fn(),
  requireApiAdmin: vi.fn(),
  ensureUserProfileForAuthUser: vi.fn(),
  getCustomerDashboardSummary: vi.fn(),
  getPartnerDashboardSummary: vi.fn(),
  getAdminDashboardSummary: vi.fn(),
}));

vi.mock('@/lib/auth/api', () => ({
  requireApiUser: mocks.requireApiUser,
  requireApiPartnerContext: mocks.requireApiPartnerContext,
  requireApiAdmin: mocks.requireApiAdmin,
}));

vi.mock('@/data/user', () => ({ ensureUserProfileForAuthUser: mocks.ensureUserProfileForAuthUser }));
vi.mock('@/data/dashboard-summary', () => ({
  getCustomerDashboardSummary: mocks.getCustomerDashboardSummary,
  getPartnerDashboardSummary: mocks.getPartnerDashboardSummary,
  getAdminDashboardSummary: mocks.getAdminDashboardSummary,
}));

describe('dashboard summary API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireApiUser.mockResolvedValue({ response: null, user: { id: 'auth-1', email: 'citra@example.com', user_metadata: { full_name: 'Citra' } } });
    mocks.requireApiPartnerContext.mockResolvedValue({ response: null, context: { partner: { id: 'partner-1' } }, user: { id: 'auth-1' } });
    mocks.requireApiAdmin.mockResolvedValue({ response: null, user: { id: 'admin-1' } });
  });

  it('returns account summary for resolved user profile', async () => {
    mocks.ensureUserProfileForAuthUser.mockResolvedValueOnce({ id: 'profile-1' });
    mocks.getCustomerDashboardSummary.mockResolvedValueOnce({ totalOrders: 2, activeTickets: 1, pendingPaymentOrders: 1 });
    const route = await import('../../app/api/account/summary/route');

    const response = await route.GET(new Request('https://test.local'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ totalOrders: 2, activeTickets: 1, pendingPaymentOrders: 1 });
    expect(mocks.getCustomerDashboardSummary).toHaveBeenCalledWith('profile-1');
  });

  it('returns partner summary for authenticated partner context', async () => {
    mocks.getPartnerDashboardSummary.mockResolvedValueOnce({ activeListings: 1, draftReviewListings: 2, requestedBookings: 0, pendingPaymentBookings: 1, monthlyPaidOrders: 3, estimatedMonthlyRevenue: 150000 });
    const route = await import('../../app/api/partner/dashboard-summary/route');

    const response = await route.GET(new Request('https://test.local'));

    expect(response.status).toBe(200);
    expect(mocks.getPartnerDashboardSummary).toHaveBeenCalledWith('partner-1');
  });

  it('returns admin summary for admin users', async () => {
    mocks.getAdminDashboardSummary.mockResolvedValueOnce({ totalPartners: 1, totalListings: 2, pendingPartnerReviews: 1, pendingListingReviews: 1, grossRevenue: 500000 });
    const route = await import('../../app/api/admin/dashboard-summary/route');

    const response = await route.GET(new Request('https://test.local'));

    expect(response.status).toBe(200);
    expect(mocks.getAdminDashboardSummary).toHaveBeenCalled();
  });
});
