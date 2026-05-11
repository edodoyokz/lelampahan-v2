import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requirePartnerOwnership: vi.fn(),
  requireListingOwnership: vi.fn(),
  requireApiPartnerContext: vi.fn(),
  listListingsForPartner: vi.fn(),
  createListingInDb: vi.fn(),
  updateListingStatus: vi.fn(),
  recordAuditLog: vi.fn(),
  findSessionsByListing: vi.fn(),
  replaceListingSessions: vi.fn(),
}));

vi.mock('@/lib/auth/api', () => ({
  requirePartnerOwnership: mocks.requirePartnerOwnership,
  requireListingOwnership: mocks.requireListingOwnership,
  requireApiPartnerContext: mocks.requireApiPartnerContext,
}));

vi.mock('@/data/listing', () => ({
  listListingsForPartner: mocks.listListingsForPartner,
  createListingInDb: mocks.createListingInDb,
  updateListingStatus: mocks.updateListingStatus,
}));

vi.mock('@/data/audit', () => ({ recordAuditLog: mocks.recordAuditLog }));
vi.mock('@/data/session', () => ({
  findSessionsByListing: mocks.findSessionsByListing,
  replaceListingSessions: mocks.replaceListingSessions,
}));

function forbidden() {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}

describe('partner listing API authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePartnerOwnership.mockResolvedValue({ response: null, context: { partner: { id: 'partner-1' } }, user: { id: 'auth-1' } });
    mocks.requireListingOwnership.mockResolvedValue({ response: null, context: { partner: { id: 'partner-1' }, userProfileId: 'profile-1' }, user: { id: 'auth-1' }, listing: { id: 'listing-1', partnerId: 'partner-1' } });
    mocks.requireApiPartnerContext.mockResolvedValue({ response: null, context: { partner: { id: 'partner-1' } }, user: { id: 'auth-1' } });
  });

  it('returns 403 for partner listings when ownership guard rejects', async () => {
    mocks.requirePartnerOwnership.mockResolvedValueOnce({ response: forbidden(), context: null });
    const route = await import('../../app/api/partner/[id]/listings/route');

    const response = await route.GET(new Request('https://test.local'), { params: Promise.resolve({ id: 'partner-2' }) });

    expect(response.status).toBe(403);
    expect(mocks.listListingsForPartner).not.toHaveBeenCalled();
  });

  it('creates listing with authenticated partner id instead of client supplied partner id', async () => {
    mocks.createListingInDb.mockResolvedValueOnce({ id: 'listing-1', partnerId: 'partner-1' });
    const route = await import('../../app/api/listing/route');

    const response = await route.POST(new Request('https://test.local', {
      method: 'POST',
      body: JSON.stringify({
        partnerId: 'partner-2',
        title: 'A'.repeat(10),
        type: 'TOUR',
        description: 'A good tour description',
        bookingMode: 'INSTANT_CONFIRMATION',
        timezone: 'Asia/Jakarta',
        tourDetails: { duration: '2 jam' },
      }),
    }));

    expect(response.status).toBe(201);
    expect(mocks.createListingInDb).toHaveBeenCalledWith(expect.objectContaining({ partnerId: 'partner-1' }));
  });

  it('returns 403 when submitting listing not owned by partner', async () => {
    mocks.requireListingOwnership.mockResolvedValueOnce({ response: forbidden(), context: null, listing: null });
    const route = await import('../../app/api/listing/[id]/submit/route');

    const response = await route.POST(new Request('https://test.local'), { params: Promise.resolve({ id: 'listing-2' }) });

    expect(response.status).toBe(403);
    expect(mocks.updateListingStatus).not.toHaveBeenCalled();
  });

  it('protects listing sessions reads with listing ownership', async () => {
    mocks.requireListingOwnership.mockResolvedValueOnce({ response: forbidden(), context: null, listing: null });
    const route = await import('../../app/api/listing/[id]/sessions/route');

    const response = await route.GET(new Request('https://test.local'), { params: Promise.resolve({ id: 'listing-2' }) });

    expect(response.status).toBe(403);
    expect(mocks.findSessionsByListing).not.toHaveBeenCalled();
  });

  it('protects listing sessions replacement with listing ownership', async () => {
    mocks.requireListingOwnership.mockResolvedValueOnce({ response: forbidden(), context: null, listing: null });
    const route = await import('../../app/api/listing/[id]/sessions/route');

    const response = await route.PUT(new Request('https://test.local', {
      method: 'PUT',
      body: JSON.stringify({ sessions: [] }),
    }), { params: Promise.resolve({ id: 'listing-2' }) });

    expect(response.status).toBe(403);
    expect(mocks.replaceListingSessions).not.toHaveBeenCalled();
  });
});
