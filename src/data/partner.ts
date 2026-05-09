import { PartnerCapabilityType, ReviewStatus } from '@prisma/client';
import { prisma } from '@/db/prisma';
import { PartnerRegistrationInput } from '@/domain/partner/validation';
import { createPartner } from '@/domain/partner/service';

export async function createPartnerInDb(input: PartnerRegistrationInput) {
  const partnerData = createPartner({ input });

  const partner = await prisma.partner.create({
    data: {
      name: partnerData.name,
      slug: partnerData.slug,
      description: partnerData.description,
      capabilities: {
        create: partnerData.capabilities.map((cap) => ({
          type: cap.type,
          status: cap.status,
        })),
      },
      bankAccounts: {
        create: {
          bankName: partnerData.bankAccount.bankName,
          accountNumber: partnerData.bankAccount.accountNumber,
          accountHolder: partnerData.bankAccount.accountHolder,
          activeForPayout: true,
        },
      },
    },
    include: {
      capabilities: true,
      bankAccounts: true,
    },
  });

  return partner;
}

export async function findPartnerById(id: string) {
  return prisma.partner.findUnique({
    where: { id },
    include: { capabilities: true, bankAccounts: true, memberships: true },
  });
}

export async function listPartners(status?: string) {
  return prisma.partner.findMany({
    where: status ? { status: status as ReviewStatus } : undefined,
    include: { capabilities: true, bankAccounts: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updatePartnerStatus(id: string, status: string) {
  return prisma.partner.update({
    where: { id },
    data: { status: status as ReviewStatus },
  });
}

export async function updatePartnerCapabilityStatus(partnerId: string, type: string, status: string) {
  return prisma.partnerCapability.update({
    where: { partnerId_type: { partnerId, type: type as PartnerCapabilityType } },
    data: { status: status as ReviewStatus },
  });
}
