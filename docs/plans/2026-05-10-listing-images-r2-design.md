# Listing Images with Cloudflare R2 Design

## Goal

Add listing image support using a flexible `ListingImage` schema and Cloudflare R2/S3-compatible direct uploads. The MVP supports one cover image in the partner create-listing flow, while the schema supports multiple images later.

## Chosen Approach

Use a separate `ListingImage` model related to `Listing`, not a single `imageUrl` field on `Listing`.

Benefits:
- Supports future gallery/reorder/delete without schema redesign.
- Allows storing R2 object key, public URL, MIME type, file size, optional dimensions, alt text, and cover flag.
- Keeps `Listing` core fields clean.

## Data Model

Add:

```prisma
model ListingImage {
  id        String   @id @default(cuid())
  listingId String
  key       String   @unique
  url       String
  alt       String?
  sortOrder Int      @default(0)
  isCover   Boolean  @default(false)
  mimeType  String
  sizeBytes Int
  width     Int?
  height    Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  listing Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@index([listingId, sortOrder])
}
```

Add to `Listing`:

```prisma
images ListingImage[]
```

## Upload Flow

Use direct browser upload to R2 via presigned URL:

1. Partner selects an image in `app/partner/listings/new/page.tsx`.
2. Browser calls `POST /api/upload/listing-image` with filename/contentType/sizeBytes.
3. API validates partner auth and file constraints, then returns `{ uploadUrl, key, publicUrl }`.
4. Browser `PUT`s the file directly to R2.
5. Browser submits listing with `coverImage` metadata.
6. `POST /api/listing` saves the listing and creates one `ListingImage` row marked `isCover=true`.

## Environment

Required for R2 upload endpoint:

```env
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""
R2_PUBLIC_BASE_URL=""
R2_ENDPOINT=""
```

`R2_ENDPOINT` may be derived from account ID when absent. `R2_PUBLIC_BASE_URL` should be the public bucket/custom-domain base URL.

## MVP UI

- Partner listing creation supports one cover image.
- Homepage listing cards use cover image.
- Listing detail hero uses cover image.
- Existing placeholder remains as fallback when no image exists.

## Testing

- Domain/lib tests for R2 validation and presigned URL generation with mocked S3 client.
- API/data tests for listing creation with cover image metadata.
- Component tests for listing card/detail fallback remain valid.

## Production Notes

- Server never receives the image binary.
- Upload endpoint validates content type and max size before signing.
- R2 credentials remain server-only.
