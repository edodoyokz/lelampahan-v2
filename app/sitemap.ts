import type { MetadataRoute } from 'next';
import { listPublishedListings } from '@/data/listing';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/account',
    '/account/orders',
    '/account/tickets',
    '/auth/login',
    '/auth/register',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));

  let listingRoutes: MetadataRoute.Sitemap = [];
  try {
    const listings = await listPublishedListings();
    listingRoutes = listings.map((listing) => ({
      url: `${baseUrl}/l/${listing.slug}`,
      lastModified: listing.updatedAt,
    }));
  } catch {
    listingRoutes = [];
  }

  return [...staticRoutes, ...listingRoutes];
}
