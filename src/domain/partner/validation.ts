import { z } from 'zod';

export const partnerRegistrationSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(8).max(20),
  requestedCapabilities: z.array(z.enum(['TOURS', 'EVENTS'])).min(1),
  bankName: z.string().min(2).max(100),
  accountNumber: z.string().min(4).max(50),
  accountHolder: z.string().min(2).max(200),
});

export type PartnerRegistrationInput = z.infer<typeof partnerRegistrationSchema>;

export type CapabilityType = 'TOURS' | 'EVENTS';
export type CapabilityStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface Capability {
  partnerId: string;
  type: CapabilityType;
  status: CapabilityStatus;
}
