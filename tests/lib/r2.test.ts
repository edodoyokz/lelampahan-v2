import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  s3Client: vi.fn(),
  putObjectCommand: vi.fn(),
  getSignedUrl: vi.fn(),
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: mocks.s3Client,
  PutObjectCommand: mocks.putObjectCommand,
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mocks.getSignedUrl,
}));

import { createListingImageUploadTarget, validateListingImageUpload } from '@/lib/r2';

describe('R2 listing image uploads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.R2_ACCOUNT_ID = 'account-id';
    process.env.R2_ACCESS_KEY_ID = 'access-key';
    process.env.R2_SECRET_ACCESS_KEY = 'secret-key';
    process.env.R2_BUCKET_NAME = 'lelampahan';
    process.env.R2_PUBLIC_BASE_URL = 'https://cdn.example.com';
    delete process.env.R2_ENDPOINT;
    mocks.getSignedUrl.mockResolvedValue('https://signed-upload.example.com');
  });

  it('rejects unsupported image type', () => {
    expect(() =>
      validateListingImageUpload({
        filename: 'cover.gif',
        contentType: 'image/gif',
        sizeBytes: 100,
      }),
    ).toThrow('Only JPEG, PNG, and WebP images are supported');
  });

  it('rejects images larger than 5MB', () => {
    expect(() =>
      validateListingImageUpload({
        filename: 'cover.jpg',
        contentType: 'image/jpeg',
        sizeBytes: 5 * 1024 * 1024 + 1,
      }),
    ).toThrow('Image must be 5MB or smaller');
  });

  it('creates a signed upload target for R2', async () => {
    const target = await createListingImageUploadTarget({
      filename: 'Cover Image.JPG',
      contentType: 'image/jpeg',
      sizeBytes: 1024,
    });

    expect(mocks.s3Client).toHaveBeenCalledWith({
      region: 'auto',
      endpoint: 'https://account-id.r2.cloudflarestorage.com',
      credentials: {
        accessKeyId: 'access-key',
        secretAccessKey: 'secret-key',
      },
    });
    expect(mocks.putObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: 'lelampahan',
        ContentType: 'image/jpeg',
        ContentLength: 1024,
      }),
    );
    expect(target.uploadUrl).toBe('https://signed-upload.example.com');
    expect(target.key).toMatch(/^listings\/tmp\/.+-cover-image\.jpg$/);
    expect(target.publicUrl).toBe(`https://cdn.example.com/${target.key}`);
  });
});
