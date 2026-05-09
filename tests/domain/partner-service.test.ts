import { describe, expect, it } from 'vitest';
import {
  createPartner,
  approvePartnerCapability,
  rejectPartnerCapability,
} from '@/domain/partner/service';
import { PartnerRegistrationInput } from '@/domain/partner/validation';

const validInput: PartnerRegistrationInput = {
  name: 'Jogja Adventure',
  description: 'Tour guide Jogja terbaik',
  contactEmail: 'info@jogjaadventure.com',
  contactPhone: '08123456789',
  requestedCapabilities: ['TOURS'],
  bankName: 'BCA',
  accountNumber: '1234567890',
  accountHolder: 'Jogja Adventure',
};

describe('partner service', () => {
  it('creates a partner registration input with valid data', () => {
    const partner = createPartner({ input: validInput });
    expect(partner.name).toBe('Jogja Adventure');
    expect(partner.slug).toBe('jogja-adventure');
    expect(partner.capabilities).toHaveLength(1);
    expect(partner.capabilities[0].type).toBe('TOURS');
  });

  it('approves a partner capability', () => {
    const capability = { partnerId: 'p1', type: 'TOURS' as const, status: 'PENDING_REVIEW' as const };
    const approved = approvePartnerCapability(capability);
    expect(approved.status).toBe('APPROVED');
  });

  it('rejects a partner capability', () => {
    const capability = { partnerId: 'p1', type: 'EVENTS' as const, status: 'PENDING_REVIEW' as const };
    const rejected = rejectPartnerCapability(capability);
    expect(rejected.status).toBe('REJECTED');
  });
});
