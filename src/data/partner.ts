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

export async function ensurePartnerOwnerMembership(input: {
  authUserId: string;
  email: string;
  name?: string | null;
  partnerId: string;
}) {
  const profile = await prisma.userProfile.upsert({
    where: { authUserId: input.authUserId },
    create: {
      authUserId: input.authUserId,
      email: input.email,
      name: input.name,
    },
    update: {
      email: input.email,
      name: input.name,
    },
  });

  return prisma.partnerMembership.upsert({
    where: { partnerId_userId: { partnerId: input.partnerId, userId: profile.id } },
    create: { partnerId: input.partnerId, userId: profile.id, role: 'OWNER' },
    update: { role: 'OWNER' },
  });
}

export async function findPartnerContextByAuthUserId(authUserId: string) {
  const profile = await prisma.userProfile.findUnique({
    where: { authUserId },
    include: {
      memberships: {
        include: { partner: { include: { capabilities: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  const membership = profile?.memberships[0];
  if (!profile || !membership) return null;

  return {
    userProfileId: profile.id,
    membershipId: membership.id,
    role: membership.role,
    partner: membership.partner,
  };
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
