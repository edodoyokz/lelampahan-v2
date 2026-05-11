import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  supabaseGetUser: vi.fn(),
  findPartnerContextByAuthUserId: vi.fn(),
  findListingById: vi.fn(),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: mocks.supabaseGetUser },
  }),
}));

vi.mock('@/data/partner', () => ({
  findPartnerContextByAuthUserId: mocks.findPartnerContextByAuthUserId,
}));

vi.mock('@/data/listing', () => ({
  findListingById: mocks.findListingById,
}));

import { requireListingOwnership, requirePartnerOwnership } from '@/lib/auth/api';

describe('API ownership guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.supabaseGetUser.mockResolvedValue({
      data: { user: { id: 'auth-1', email: 'partner@example.com' } },
    });
  });

  it('rejects partner ownership when authenticated user belongs to another partner', async () => {
    mocks.findPartnerContextByAuthUserId.mockResolvedValue({
      userProfileId: 'profile-1',
      membershipId: 'membership-1',
      role: 'OWNER',
      partner: { id: 'partner-a', name: 'Partner A', status: 'APPROVED' },
    });

    const result = await requirePartnerOwnership(new Request('https://test.local'), 'partner-b');

    expect(result.context).toBeNull();
    expect(result.response?.status).toBe(403);
  });

  it('allows partner ownership when partner ids match', async () => {
    mocks.findPartnerContextByAuthUserId.mockResolvedValue({
      userProfileId: 'profile-1',
      membershipId: 'membership-1',
      role: 'OWNER',
      partner: { id: 'partner-a', name: 'Partner A', status: 'APPROVED' },
    });

    const result = await requirePartnerOwnership(new Request('https://test.local'), 'partner-a');

    expect(result.response).toBeNull();
    expect(result.context?.partner.id).toBe('partner-a');
  });

  it('rejects listing ownership when listing belongs to another partner', async () => {
    mocks.findPartnerContextByAuthUserId.mockResolvedValue({
      userProfileId: 'profile-1',
      membershipId: 'membership-1',
      role: 'OWNER',
      partner: { id: 'partner-a', name: 'Partner A', status: 'APPROVED' },
    });
    mocks.findListingById.mockResolvedValue({ id: 'listing-1', partnerId: 'partner-b' });

    const result = await requireListingOwnership(new Request('https://test.local'), 'listing-1');

    expect(result.context).toBeNull();
    expect(result.listing).toBeNull();
    expect(result.response?.status).toBe(403);
  });
});
