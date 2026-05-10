import { randomUUID } from 'crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DomainError } from '@/domain/shared/errors';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export interface ListingImageUploadInput {
  filename: string;
  contentType: string;
  sizeBytes: number;
}

export interface ListingImageUploadTarget {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new DomainError('R2_CONFIG_MISSING', `Missing ${name}`);
  }
  return value;
}

export function validateListingImageUpload(input: ListingImageUploadInput) {
  if (!ALLOWED_IMAGE_TYPES.has(input.contentType)) {
    throw new DomainError('INVALID_IMAGE_TYPE', 'Only JPEG, PNG, and WebP images are supported');
  }

  if (!Number.isInteger(input.sizeBytes) || input.sizeBytes <= 0) {
    throw new DomainError('INVALID_IMAGE_SIZE', 'Image size must be greater than zero');
  }

  if (input.sizeBytes > MAX_IMAGE_SIZE_BYTES) {
    throw new DomainError('IMAGE_TOO_LARGE', 'Image must be 5MB or smaller');
  }
}

function sanitizeFilename(filename: string): string {
  const cleaned = filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return cleaned || 'listing-image';
}

function getR2Endpoint(): string {
  return process.env.R2_ENDPOINT ?? `https://${requireEnv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`;
}

export function getListingImagePublicUrl(key: string): string {
  const baseUrl = requireEnv('R2_PUBLIC_BASE_URL').replace(/\/$/, '');
  return `${baseUrl}/${key}`;
}

export async function createListingImageUploadTarget(
  input: ListingImageUploadInput,
): Promise<ListingImageUploadTarget> {
  validateListingImageUpload(input);

  const bucket = requireEnv('R2_BUCKET_NAME');
  const key = `listings/tmp/${randomUUID()}-${sanitizeFilename(input.filename)}`;

  const client = new S3Client({
    region: 'auto',
    endpoint: getR2Endpoint(),
    credentials: {
      accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
    },
  });

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: input.contentType,
    ContentLength: input.sizeBytes,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 * 5 });

  return {
    uploadUrl,
    key,
    publicUrl: getListingImagePublicUrl(key),
  };
}
