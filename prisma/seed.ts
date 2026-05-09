import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

config({ path: '.env' });

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? '';

if (!connectionString) {
  console.error('DATABASE_URL or DIRECT_URL is required');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString),
  log: ['error'],
});

async function main() {
  console.log('🌱 Seeding Lelampahan...');

  // ---- User Profile (placeholder customer) ----
  const customer = await prisma.userProfile.upsert({
    where: { email: 'budi@example.com' },
    update: {},
    create: {
      authUserId: 'seed-customer-01',
      email: 'budi@example.com',
      name: 'Budi Santoso',
      role: 'CUSTOMER',
    },
  });
  console.log('  ✅ Customer:', customer.email);

  // ---- Partner: Jogja Adventure (tours) ----
  const partnerTour = await prisma.partner.upsert({
    where: { slug: 'jogja-adventure' },
    update: {},
    create: {
      name: 'Jogja Adventure',
      slug: 'jogja-adventure',
      description:
        'Penyedia pengalaman tur heritage, alam, dan kuliner di Yogyakarta sejak 2018.',
      status: 'APPROVED',
      capabilities: {
        create: [{ type: 'TOURS', status: 'APPROVED' }],
      },
    },
  });
  console.log('  ✅ Partner:', partnerTour.name);

  // ---- Partner: Komunitas Seni Jogja (events) ----
  const partnerEvent = await prisma.partner.upsert({
    where: { slug: 'komunitas-seni-jogja' },
    update: {},
    create: {
      name: 'Komunitas Seni Jogja',
      slug: 'komunitas-seni-jogja',
      description:
        'Komunitas pelaku seni dan budaya yang rutin mengadakan workshop, pameran, dan pertunjukan di Yogyakarta.',
      status: 'APPROVED',
      capabilities: {
        create: [{ type: 'EVENTS', status: 'APPROVED' }],
      },
    },
  });
  console.log('  ✅ Partner:', partnerEvent.name);

  // ---- Listing: Jelajah Kotagede Heritage (TOUR) ----
  const tourListing = await prisma.listing.upsert({
    where: { slug: 'jelajah-kotagede-heritage' },
    update: {},
    create: {
      partnerId: partnerTour.id,
      type: 'TOUR',
      title: 'Jelajah Kotagede Heritage',
      slug: 'jelajah-kotagede-heritage',
      description:
        'Susuri lorong-lorong bersejarah Kotagede, kunjungi Masjid Mataram, pasar tradisional, dan kompleks makam raja-raja Mataram. Tur ini dipandu oleh sejarawan lokal yang akan membawa Anda menelusuri jejak kerajaan Islam pertama di Jawa.',
      status: 'PUBLISHED',
      bookingMode: 'INSTANT_CONFIRMATION',
      timezone: 'Asia/Jakarta',
      tourDetail: {
        create: {
          duration: '4 jam',
          itinerary: [
            { time: '08:00', activity: 'Kumpul di Pasar Kotagede & pengantar sejarah' },
            { time: '08:30', activity: 'Masjid Mataram & kompleks makam raja-raja' },
            { time: '09:30', activity: 'Jalan kaki menyusuri lorong heritage Kotagede' },
            { time: '10:30', activity: 'Kunjungan ke rumah Kalang & kerajinan perak' },
            { time: '11:30', activity: 'Makan siang di warung legendaris Kotagede' },
            { time: '12:00', activity: 'Selesai' },
          ],
          included: ['Pemandu sejarawan', 'Snack & air mineral', 'Tiket masuk kompleks makam'],
          excluded: ['Transportasi ke titik kumpul', 'Belanja pribadi'],
        },
      },
    },
  });
  console.log('  ✅ Listing:', tourListing.title);

  // ---- Listing: Workshop Batik Tulis (EVENT) ----
  const eventListing = await prisma.listing.upsert({
    where: { slug: 'workshop-batik-tulis' },
    update: {},
    create: {
      partnerId: partnerEvent.id,
      type: 'EVENT',
      title: 'Workshop Batik Tulis Yogyakarta',
      slug: 'workshop-batik-tulis',
      description:
        'Belajar membatik langsung dari maestro batik Giriloyo. Dalam workshop 3 jam ini Anda akan membuat selembar kain batik tulis dari awal hingga akhir — mulai dari nyanting, nyolet, hingga fiksasi warna. Semua bahan disediakan, hasil karya bisa dibawa pulang.',
      status: 'PUBLISHED',
      bookingMode: 'INSTANT_CONFIRMATION',
      timezone: 'Asia/Jakarta',
      eventDetail: {
        create: {
          venue: 'Omah Batik Giriloyo, Imogiri, Bantul',
          gateNotes: 'Parkir tersedia. Datang 15 menit sebelum sesi dimulai.',
        },
      },
    },
  });
  console.log('  ✅ Listing:', eventListing.title);

  // ---- Sessions: Jelajah Kotagede ----
  const tourSessions = await Promise.all([
    prisma.session.upsert({
      where: { id: 'seed-tour-session-1' },
      update: {},
      create: {
        id: 'seed-tour-session-1',
        listingId: tourListing.id,
        startsAt: new Date('2026-05-16T08:00:00+07:00'),
        endsAt: new Date('2026-05-16T12:00:00+07:00'),
        capacity: 15,
        bookingCutoff: new Date('2026-05-15T18:00:00+07:00'),
        status: 'PUBLISHED',
      },
    }),
    prisma.session.upsert({
      where: { id: 'seed-tour-session-2' },
      update: {},
      create: {
        id: 'seed-tour-session-2',
        listingId: tourListing.id,
        startsAt: new Date('2026-05-23T08:00:00+07:00'),
        endsAt: new Date('2026-05-23T12:00:00+07:00'),
        capacity: 15,
        bookingCutoff: new Date('2026-05-22T18:00:00+07:00'),
        status: 'PUBLISHED',
      },
    }),
    prisma.session.upsert({
      where: { id: 'seed-tour-session-3' },
      update: {},
      create: {
        id: 'seed-tour-session-3',
        listingId: tourListing.id,
        startsAt: new Date('2026-05-30T08:00:00+07:00'),
        endsAt: new Date('2026-05-30T12:00:00+07:00'),
        capacity: 20,
        bookingCutoff: new Date('2026-05-29T18:00:00+07:00'),
        status: 'PUBLISHED',
      },
    }),
  ]);
  console.log('  ✅ Tour sessions:', tourSessions.length);

  // ---- Sessions: Workshop Batik ----
  const eventSessions = await Promise.all([
    prisma.session.upsert({
      where: { id: 'seed-event-session-1' },
      update: {},
      create: {
        id: 'seed-event-session-1',
        listingId: eventListing.id,
        startsAt: new Date('2026-05-17T09:00:00+07:00'),
        endsAt: new Date('2026-05-17T12:00:00+07:00'),
        capacity: 10,
        bookingCutoff: new Date('2026-05-16T18:00:00+07:00'),
        status: 'PUBLISHED',
      },
    }),
    prisma.session.upsert({
      where: { id: 'seed-event-session-2' },
      update: {},
      create: {
        id: 'seed-event-session-2',
        listingId: eventListing.id,
        startsAt: new Date('2026-05-24T09:00:00+07:00'),
        endsAt: new Date('2026-05-24T12:00:00+07:00'),
        capacity: 12,
        bookingCutoff: new Date('2026-05-23T18:00:00+07:00'),
        status: 'PUBLISHED',
      },
    }),
  ]);
  console.log('  ✅ Event sessions:', eventSessions.length);

  // ---- Ticket Types for tour sessions ----
  for (const session of tourSessions) {
    await prisma.ticketType.upsert({
      where: { id: `seed-tt-${session.id}-regular` },
      update: {},
      create: {
        id: `seed-tt-${session.id}-regular`,
        sessionId: session.id,
        name: 'Dewasa',
        price: 150000,
        quota: Math.floor(session.capacity * 0.8),
        active: true,
      },
    });
    await prisma.ticketType.upsert({
      where: { id: `seed-tt-${session.id}-anak` },
      update: {},
      create: {
        id: `seed-tt-${session.id}-anak`,
        sessionId: session.id,
        name: 'Anak (5-12 th)',
        price: 75000,
        quota: Math.floor(session.capacity * 0.2),
        active: true,
      },
    });
  }
  console.log('  ✅ Tour ticket types');

  // ---- Ticket Types for event sessions ----
  for (const session of eventSessions) {
    await prisma.ticketType.upsert({
      where: { id: `seed-tt-${session.id}-regular` },
      update: {},
      create: {
        id: `seed-tt-${session.id}-regular`,
        sessionId: session.id,
        name: 'Peserta',
        price: 250000,
        quota: session.capacity,
        active: true,
      },
    });
  }
  console.log('  ✅ Event ticket types');

  // ---- Partner Membership (sample partner user) ----
  const partnerUser = await prisma.userProfile.upsert({
    where: { email: 'owner@jogjaadventure.com' },
    update: {},
    create: {
      authUserId: 'seed-partner-01',
      email: 'owner@jogjaadventure.com',
      name: 'Pak Joko',
      role: 'CUSTOMER',
    },
  });

  await prisma.partnerMembership.upsert({
    where: { partnerId_userId: { partnerId: partnerTour.id, userId: partnerUser.id } },
    update: {},
    create: { partnerId: partnerTour.id, userId: partnerUser.id, role: 'OWNER' },
  });
  console.log('  ✅ Partner membership: Pak Joko → Jogja Adventure');

  // ---- Sample Order (paid) ----
  const sampleOrder = await prisma.order.upsert({
    where: { id: 'seed-order-paid-01' },
    update: {},
    create: {
      id: 'seed-order-paid-01',
      orderNumber: 'LM-20260516-ABCD',
      userId: customer.id,
      sessionId: tourSessions[0].id,
      totalAmount: 150000,
      status: 'PAID',
      items: {
        create: [
          {
            id: 'seed-item-paid-01',
            ticketTypeId: `seed-tt-${tourSessions[0].id}-regular`,
            quantity: 1,
            unitPrice: 150000,
            subtotal: 150000,
          },
        ],
      },
      participants: {
        create: [
          {
            name: 'Budi Santoso',
            email: 'budi@example.com',
            phone: '081234567890',
          },
        ],
      },
    },
  });
  console.log('  ✅ Sample order:', sampleOrder.orderNumber);

  console.log('\n🎉 Seed selesai!');
  console.log('  Marketplace: http://localhost:3000');
  console.log('  Listing tour:', `/l/${tourListing.slug}`);
  console.log('  Listing event:', `/l/${eventListing.slug}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
