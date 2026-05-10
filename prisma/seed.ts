import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import { createSeedAuthAccounts, createSeedSupabaseAdminClient, seedAuthAccounts } from './seed-auth-accounts';

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

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for seed image upload`);
  }

  return value;
}

function getR2Endpoint() {
  return process.env.R2_ENDPOINT ?? `https://${requireEnv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`;
}

function getR2PublicUrl(key: string) {
  const baseUrl = requireEnv('R2_PUBLIC_BASE_URL').replace(/\/$/, '');
  return `${baseUrl}/${key}`;
}

const r2Client = new S3Client({
  region: 'auto',
  endpoint: getR2Endpoint(),
  credentials: {
    accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
  },
});

async function uploadSeedListingImage(input: {
  listingId: string;
  title: string;
  filename: string;
}) {
  const key = `listings/seed/${input.filename}`;
  const filePath = path.join(process.cwd(), 'prisma', 'seed-assets', 'listings', input.filename);
  const [body, fileStat] = await Promise.all([readFile(filePath), stat(filePath)]);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: requireEnv('R2_BUCKET_NAME'),
      Key: key,
      Body: body,
      ContentType: 'image/webp',
      ContentLength: fileStat.size,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  await prisma.listingImage.updateMany({
    where: { listingId: input.listingId, isCover: true, key: { not: key } },
    data: { isCover: false },
  });

  await prisma.listingImage.upsert({
    where: { key },
    update: {
      listingId: input.listingId,
      url: getR2PublicUrl(key),
      alt: input.title,
      sortOrder: 0,
      isCover: true,
      mimeType: 'image/webp',
      sizeBytes: fileStat.size,
      width: 1280,
      height: 720,
    },
    create: {
      listingId: input.listingId,
      key,
      url: getR2PublicUrl(key),
      alt: input.title,
      sortOrder: 0,
      isCover: true,
      mimeType: 'image/webp',
      sizeBytes: fileStat.size,
      width: 1280,
      height: 720,
    },
  });

  return getR2PublicUrl(key);
}

async function main() {
  console.log('🌱 Seeding Lelampahan...');

  // ---- Auth users + User Profiles for each role ----
  const seedAccounts = createSeedAuthAccounts();
  const supabaseAdmin = createSeedSupabaseAdminClient();
  const seededAuthAccounts = supabaseAdmin ? await seedAuthAccounts(supabaseAdmin, seedAccounts) : [];
  const authIdByEmail = new Map(seededAuthAccounts.map((account) => [account.email, account.authUserId]));

  if (supabaseAdmin) {
    console.log('  ✅ Supabase auth users:', seededAuthAccounts.length);
  } else {
    console.log('  ⚠️  Supabase auth seed skipped: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing');
  }

  const seededProfiles = await Promise.all(
    seedAccounts.map((account) =>
      prisma.userProfile.upsert({
        where: { email: account.email },
        update: {
          authUserId: authIdByEmail.get(account.email) ?? `seed-${account.email}`,
          name: account.name,
          role: account.role,
        },
        create: {
          authUserId: authIdByEmail.get(account.email) ?? `seed-${account.email}`,
          email: account.email,
          name: account.name,
          role: account.role,
        },
      }),
    ),
  );
  const customer = seededProfiles.find((profile) => profile.email === 'customer@lelampahan.test')!;
  const partnerOwner = seededProfiles.find((profile) => profile.email === 'partner@lelampahan.test')!;
  console.log('  ✅ Role profiles:', seededProfiles.map((profile) => `${profile.email} (${profile.role})`).join(', '));

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
        'Susuri lorong bersejarah Kotagede bersama pemandu lokal. Dalam tur ini, Anda akan mengunjungi Masjid Mataram, pasar tradisional, kompleks makam raja-raja Mataram, hingga jejak rumah Kalang dan kerajinan perak. Cocok untuk Anda yang ingin memahami Jogja dari sisi sejarah dan kehidupan lokalnya.',
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
        'Belajar membatik langsung dari perajin batik Giriloyo. Selama 3 jam, Anda akan mencoba proses batik tulis dari nyanting, pewarnaan, hingga fiksasi warna. Semua bahan sudah disediakan, dan hasil karya bisa Anda bawa pulang sebagai kenang-kenangan dari Jogja.',
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

  // ---- Listing Images: upload generated seed assets to Cloudflare R2 ----
  await Promise.all([
    uploadSeedListingImage({
      listingId: tourListing.id,
      title: tourListing.title,
      filename: 'jelajah-kotagede-heritage.webp',
    }),
    uploadSeedListingImage({
      listingId: eventListing.id,
      title: eventListing.title,
      filename: 'workshop-batik-tulis.webp',
    }),
  ]);
  console.log('  ✅ Listing images uploaded to R2');

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
  await prisma.partnerMembership.upsert({
    where: { partnerId_userId: { partnerId: partnerTour.id, userId: partnerOwner.id } },
    update: { role: 'OWNER' },
    create: { partnerId: partnerTour.id, userId: partnerOwner.id, role: 'OWNER' },
  });
  console.log('  ✅ Partner membership: Partner Jogja Adventure → Jogja Adventure');

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
  console.log('  Demo password:', process.env.SEED_AUTH_PASSWORD ?? 'Password123!');
  console.log('  Customer:', 'customer@lelampahan.test');
  console.log('  Admin:', 'admin@lelampahan.test');
  console.log('  Super admin:', 'superadmin@lelampahan.test');
  console.log('  Partner:', 'partner@lelampahan.test');
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
