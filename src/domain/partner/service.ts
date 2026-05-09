import { PartnerRegistrationInput, Capability, CapabilityType, CapabilityStatus } from './validation';
import { generateSlug } from '@/config/slug';

export interface PartnerCreateResult {
  name: string;
  description: string | undefined;
  contactEmail: string;
  contactPhone: string;
  slug: string;
  capabilities: { type: CapabilityType; status: CapabilityStatus }[];
  bankAccount: { bankName: string; accountNumber: string; accountHolder: string };
}

export function createPartner(input: { input: PartnerRegistrationInput }): PartnerCreateResult {
  const slug = generateSlug(input.input.name);

  return {
    name: input.input.name,
    description: input.input.description,
    contactEmail: input.input.contactEmail,
    contactPhone: input.input.contactPhone,
    slug,
    capabilities: input.input.requestedCapabilities.map((type) => ({
      type,
      status: 'PENDING_REVIEW' as CapabilityStatus,
    })),
    bankAccount: {
      bankName: input.input.bankName,
      accountNumber: input.input.accountNumber,
      accountHolder: input.input.accountHolder,
    },
  };
}

export function approvePartnerCapability(capability: Capability): Capability {
  return { ...capability, status: 'APPROVED' };
}

export function rejectPartnerCapability(capability: Capability): Capability {
  return { ...capability, status: 'REJECTED' };
}
